/*
EMAILJS SETUP INSTRUCTIONS:
1. Sign up at https://www.emailjs.com/
2. Add an Email Service (Gmail recommended) and note down the Service ID
3. Create an Email Template and note down the Template ID
4. Get your Public Key from the Account page
5. replace the three constants below with your actual values
*/

// replace these with your actual EmailJS credentials
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';           // From Account > API Keys
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';           // From Email Services tab
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';         // From Email Templates tab

// Initialize EmailJS
(function() {
    emailjs.init(EMAILJS_PUBLIC_KEY);
})();

// Function to send email
function sendEmail(formData) 