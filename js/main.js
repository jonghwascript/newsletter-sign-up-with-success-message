const $signupForm = $('#signup-form');
const $dismissbtn = $('.dismiss-btn');
const $emailInput = $('#signup-form input[name="email"]');
const $emailError = $('#signup-form .input-box span');

$emailInput.on('invalid', function (event) {
  event.preventDefault(); // 기본 유효성 검사 말풍선 대신 커스텀 에러 UI를 보여줌
  $emailInput.addClass('invalid').attr('aria-invalid', 'true');
  $emailError.addClass('invalid');
});

$emailInput.on('input', function () {
  $emailInput.removeClass('invalid').attr('aria-invalid', 'false');
  $emailError.removeClass('invalid');
});

$signupForm.on('submit', function (event) {
  event.preventDefault();
  const email = $emailInput.val();
  window.location.href = 'success.html?email=' + encodeURIComponent(email);
});

$dismissbtn.on('click', function (event) {
  event.preventDefault();
  window.location.href = 'index.html';
});

// success.html: render the submitted email from the query string, if present
const submittedEmail = new URLSearchParams(window.location.search).get('email');
if (submittedEmail) {
  $('.submitted-email').text(submittedEmail);
}

// success.html: present the success message as a native <dialog> on
// tablet+ (matches the 'tablet' breakpoint used in style.scss) instead
// of the plain full-screen section, so it gets real dialog semantics,
// a trapped focus, and automatic focus return on close.
const successDialog = document.getElementById('modal-notice');

if (successDialog) {
  const tabletQuery = window.matchMedia('(min-width: 768px)');

  function syncSuccessDialog(query) {
    if (query.matches && !successDialog.open) {
      successDialog.showModal();
    } else if (!query.matches && successDialog.open) {
      successDialog.close();
    }
  }

  syncSuccessDialog(tabletQuery);
  tabletQuery.addEventListener('change', function () {
    syncSuccessDialog(tabletQuery);
  });

  // Escape key (or other native dismissal) should behave like the
  // Dismiss button, not just silently close the dialog in place.
  successDialog.addEventListener('cancel', function () {
    window.location.href = 'index.html';
  });
}