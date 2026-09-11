const $signupForm = $('#signup-form');
const $dismissbtn = $('.dismiss-btn');
const $emailInput = $('#signup-form input[name="email"]');
const $emailError = $('#signup-form .input-box span');

$emailInput.on('invalid', function (event) {
  event.preventDefault(); // 기본 유효성 검사 말풍선 대신 커스텀 에러 UI를 보여줌
  $emailInput.addClass('invalid');
  $emailError.addClass('invalid');
});

$emailInput.on('input', function () {
  $emailInput.removeClass('invalid');
  $emailError.removeClass('invalid');
});

$signupForm.on('submit', function (event) {
  event.preventDefault();
  window.location.href = 'success.html';
});

$dismissbtn.on('click', function (event) {  
  event.preventDefault();
  window.location.href = 'index.html';
});