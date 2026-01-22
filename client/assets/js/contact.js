document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    name: f.name.value.trim(),
    email: f.email.value.trim(),
    phone: f.phone.value.trim(),
    message: f.message.value.trim()
  };
  const res = await API.createOrder(payload);
  document.getElementById('status').textContent = 'Inquiry submitted successfully.';
  f.reset();
});