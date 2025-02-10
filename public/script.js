document.getElementById('reportForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData(this); // Automatically collect form data

  fetch('/submit-report', {
      method: 'POST',
      body: formData // No need to set Content-Type header; FormData does it automatically
  })
  .then(response => {
      if (!response.ok) { // Check for HTTP errors (4xx or 5xx)
          return response.json().then(err => { throw new Error(err.message || 'Server error') }); // Throw error with server message
      }
      return response.json(); // Parse JSON response if successful
  })
  .then(data => {
      if (data.message) {
          displayMessage(data.message, 'success'); // Display success message
      } else {
          console.warn('Unexpected server response:', data); // Log unexpected data
          displayMessage('Report submitted, but server response was unexpected.', 'warning');
      }
  })
  .catch(error => {
      console.error('Submission Error:', error); // Log detailed error for debugging
      displayMessage(error.message || 'Failed to submit report. Please try again.', 'error'); // Display user-friendly error
  })
  .finally(() => { // Always reset the form, regardless of success or failure
      this.reset(); // Clear the form after submission
  });
});

function displayMessage(message, type) {
  const messageDiv = document.getElementById('message'); // Get the message display element

  if (!messageDiv) {
      console.error('Message element not found!');
      return;
  }

  messageDiv.textContent = message; // Set the message text

  // Set a class based on the message type for styling
  messageDiv.className = type; // e.g., 'success', 'error', 'warning'

  // Or use more sophisticated styling
  if (type === 'success') {
      messageDiv.style.color = 'green';
  } else if (type === 'error') {
      messageDiv.style.color = 'red';
  } else if (type === 'warning') {
      messageDiv.style.color = 'orange';
  }
}