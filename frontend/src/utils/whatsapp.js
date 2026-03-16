export const sendWhatsAppOrder = (plantName) => {
  const message = encodeURIComponent(
    `Hello, I want to order this plant from HomeGarden:\n\n🌱 Plant Name: ${plantName}\n\nPlease provide details about availability and payment.`
  );
  window.open(`https://wa.me/?text=${message}`, '_blank');
};