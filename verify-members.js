const base = 'http://localhost:4000';

async function call(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { status: res.status, data };
}

(async () => {
  const phone = '998' + String(Math.floor(1000000 + Math.random() * 9000000));

  const create = await call('POST', '/api/members', {
    full_name: 'Alpha User',
    father_name: 'Father',
    phone,
    membership_type: 'ماهانه',
    monthly_fee: 500,
    attendance_time: 'روز',
    start_date: '2026-04-05',
    end_date: '2026-05-05',
    notes: 'Initial registration'
  });
  console.log('CREATE', create.status, JSON.stringify({ id: create.data.id, error: create.data.error || null }));

  const duplicate = await call('POST', '/api/members', {
    full_name: 'Alpha User',
    father_name: 'Father',
    phone,
    membership_type: 'ماهانه',
    monthly_fee: 500,
    attendance_time: 'روز',
    start_date: '2026-06-01',
    end_date: '2026-06-30'
  });
  console.log('DUPLICATE', duplicate.status, duplicate.data.error || duplicate.data.message || 'ok');

  const memberId = create.data.id;
  const membership = await call('POST', '/api/members/' + memberId + '/memberships', {
    membership_month: 'June 2026',
    start_date: '2026-06-01',
    end_date: '2026-06-30',
    amount_paid: 500,
    remaining_amount: 0,
    duration_months: 1,
    payment_status: 'پرداخت شده',
    notes: 'Renewal'
  });
  console.log('MEMBERSHIP', membership.status, membership.data.member_name || membership.data.error || 'ok');

  const detail = await call('GET', '/api/members/' + memberId);
  console.log('DETAIL', detail.status, JSON.stringify({
    memberships: detail.data.memberships && detail.data.memberships.length,
    first_month: detail.data.memberships && detail.data.memberships[0] ? detail.data.memberships[0].membership_month : null,
    created_at: detail.data.created_at,
    start_date: detail.data.start_date
  }));
})();
