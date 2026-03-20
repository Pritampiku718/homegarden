const YOUR_WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER; // e.g., 918597511728

export const sendWhatsAppMessage = (message) => {
  console.log('📱 Sending WhatsApp message...');
  
  const encoded = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${YOUR_WHATSAPP_NUMBER}?text=${encoded}`;
  
  // Try to open in new window
  const newWindow = window.open(whatsappUrl, '_blank');
  
  // If popup blocked, use direct link
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    window.location.href = whatsappUrl;
  }
};

// Keep for backward compatibility
export const sendWhatsAppOrder = (plantName) => {
  const message = `Hello, I want to order this plant from HomeGarden:\n\n🌱 Plant Name: ${plantName}`;
  sendWhatsAppMessage(message);
};