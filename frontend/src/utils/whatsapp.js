const YOUR_WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER; // e.g., 918597511728

export const sendWhatsAppMessage = (message) => {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${YOUR_WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
};

// Keep the old function for backward compatibility
export const sendWhatsAppOrder = (plantName) => {
  const message = `Hello, I want to order this plant from HomeGarden:\n\n🌱 Plant Name: ${plantName}`;
  sendWhatsAppMessage(message);
};