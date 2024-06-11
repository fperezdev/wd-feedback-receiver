const urlParams = new URLSearchParams(window.location.search);
const prod = true;

window.onload = () => {
  const title = document.getElementById("title");
  const regards = document.getElementById("regards");
  const thanks = document.getElementById("thanks");
  const subtitle = document.getElementById("subtitle");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");

  function hideAnswer() {
    title.style.display = "none";
    subtitle.style.display = "none";
    btnYes.style.display = "none";
    btnNo.style.display = "none";
  }

  if (urlParams.has("email") && urlParams.has("template")) {
    const email = urlParams.get("email");
    const template = urlParams.get("template");
    function sendAnswer(answer) {
      fetch(
        prod
          ? `https://wd-feedback-receiver-production.up.railway.app/feedback?email=${email}&value=${answer}&template=${template}`
          : `http://localhost:3000/feedback?email=${email}&value=${answer}&template=${template}`,
        {
          method: "GET",
        }
      );
      hideAnswer();
      thanks.style.display = "block";
    }
    btnYes.onclick = () => sendAnswer(1);
    btnNo.onclick = () => sendAnswer(0);
  } else {
    hideAnswer();
    regards.style.display = "block";
    const email = urlParams.get("email");
    fetch(
      prod
        ? `https://wd-feedback-receiver-production.up.railway.app/feedback?email=${email}&value=0&template=invalid`
        : `http://localhost:3000/feedback?email=${email}&value=0&template=invalid`,
      {
        method: "GET",
      }
    );
  }
  window.history.pushState({}, document.title, "/");
};
