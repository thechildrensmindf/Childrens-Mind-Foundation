/**
 * Contact Form Handler Script
 * 
 * This script enables the contact form on the website to:
 * 1. Submit to the secure backend API
 * 2. Keep the view at the form location
 * 3. Display success/error messages
 * 
 * Add this script to your HTML or include it in the bundled app.
 */

(function initContactForm() {
  // Wait for the DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupContactForm);
  } else {
    setupContactForm();
  }

  function setupContactForm() {
    // Find the contact form
    const contactForm = document.querySelector('form[data-contact-form="true"]') ||
                       document.querySelector('form.contact-form') ||
                       Array.from(document.querySelectorAll("form")).find(f =>
                         f.textContent.includes("email") &&
                         f.textContent.includes("message")
                       );

    if (!contactForm) {
      console.warn("Contact form not found on page");
      return;
    }

    contactForm.addEventListener("submit", handleFormSubmit);

    async function handleFormSubmit(e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contactForm);
      const data = {
        name: formData.get("name") || formData.get("fullName") || "",
        email: formData.get("email") || "",
        subject: formData.get("subject") || "",
        topic: formData.get("topic") || formData.get("subject") || "",
        message: formData.get("message") || "",
      };

      // Get or create success message element
      let successMessage = document.getElementById("contact-form-success");
      let errorMessage = document.getElementById("contact-form-error");
      let submitButton = contactForm.querySelector('button[type="submit"]');

      // Create message containers if they don't exist
      if (!successMessage) {
        successMessage = document.createElement("div");
        successMessage.id = "contact-form-success";
        successMessage.style.cssText = `
          display: none;
          padding: 16px;
          margin: 16px 0;
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          color: #155724;
          font-weight: 500;
        `;
        contactForm.parentNode.insertBefore(successMessage, contactForm);
      }

      if (!errorMessage) {
        errorMessage = document.createElement("div");
        errorMessage.id = "contact-form-error";
        errorMessage.style.cssText = `
          display: none;
          padding: 16px;
          margin: 16px 0;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          color: #721c24;
          font-weight: 500;
        `;
        contactForm.parentNode.insertBefore(errorMessage, contactForm);
      }

      try {
        // Disable submit button during submission
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Sending...";
        }

        // Determine the API endpoint
        const apiEndpoint = window.location.origin.includes("localhost")
          ? "/api/contact"
          : "/api/contact"; // Vercel will serve from the same origin

        // Send the form data to the API
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Show success message
          successMessage.textContent = result.message || 
            "Thank you! Your message has been sent successfully. We'll get back to you soon.";
          successMessage.style.display = "block";
          errorMessage.style.display = "none";

          // Clear the form
          contactForm.reset();

          // Scroll to the form to show the success message
          contactForm.scrollIntoView({ behavior: "smooth", block: "nearest" });

          // Hide success message after 5 seconds
          setTimeout(() => {
            successMessage.style.display = "none";
          }, 5000);
        } else {
          // Show error message
          errorMessage.textContent = result.error || 
            "Failed to send your message. Please try again later.";
          errorMessage.style.display = "block";
          successMessage.style.display = "none";
        }
      } catch (error) {
        console.error("Contact form submission error:", error);
        errorMessage.textContent = 
          "An error occurred while sending your message. Please try again later.";
        errorMessage.style.display = "block";
        successMessage.style.display = "none";
      } finally {
        // Re-enable submit button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send";
        }
      }
    }
  }
})();
