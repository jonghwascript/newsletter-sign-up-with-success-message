const $signupForm = $('#signup-form');
const $dismissbtn = $('.dismiss-btn');


$signupForm.on('submit', function (event) {
  event.preventDefault();
  window.location.href = 'success.html';
});

$dismissbtn.on('click', function (event) {  
  event.preventDefault();
  window.location.href = 'index.html';
});