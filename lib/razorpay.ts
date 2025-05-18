// Utility functions for Razorpay integration

// Function to load Razorpay script
export function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// Generate Razorpay order
export async function createRazorpayOrder(amount: number): Promise<string> {
  try {
    const response = await fetch("/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create payment order");
    }
    
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
}

// Verify Razorpay payment
export function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  return fetch("/api/payment/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      paymentId,
      signature,
    }),
  }).then((response) => response.ok);
} 