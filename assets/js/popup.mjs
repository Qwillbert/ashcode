export default function popup(options = {
    content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore voluptatem debitis tempore aut consectetur libero nobis ea beatae repudiandae. Possimus perspiciatis perferendis ad autem, suscipit facilis obcaecati sed praesentium. Placeat.",
    title:"Hello World!",
    bg: true,
    clickToClose: true,
    escToClose: true,
    closeBtn: true,
    closeBtnText: "x"
}){
    const body = document.body;

    const previousOverflowState = body.style.overflow;
    body.style.overflow = "hidden";

    const popupContainer = document.createElement('div');
    popupContainer.className = "popup-container";
    popupContainer.innerHTML = `
      <div class="popup">
        <h1 class="popup-header">${options.title}</h1>
        <div class="popup-content">
          ${options.content}
          </div>
          ${options.closeBtn ? `<button class="popup-close">${options.closeBtnText}</button>` : ""}
      </div>
      ${options.bg ? `<div class="popup-bg"></div>` : ""}
    `;

    body.appendChild(popupContainer);
    popupContainer.focus();

    const closePopup = () => {
        popupContainer.remove();
        body.style.overflow = previousOverflowState;
        cleanupListeners();
    };

    if (options.escToClose) {
        const escListener = (e) => {
            if (e.key === "Escape") {
                closePopup();
                document.removeEventListener('keydown', escListener);
            }
        };
        document.addEventListener("keydown", escListener);
    }

    const clickListener = (e) => {
        if (options.clickToClose && (e.target.classList.contains("popup-bg") || e.target.classList.contains("popup-close"))) {
            closePopup();
        }
    };
    document.addEventListener("click", clickListener);

    if (options.closeBtn) {
        document.querySelectorAll('.popup-close').forEach(element => {
            element.addEventListener("click", closePopup);
        });
    }

    function cleanupListeners() {
        document.removeEventListener("click", clickListener);
    }

    return closePopup;
}