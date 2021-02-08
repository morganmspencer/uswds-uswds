const behavior = require("../utils/behavior");
const select = require("../utils/select");
const FocusTrap = require("../utils/focus-trap");
const ScrollBarWidth = require("../utils/scrollbar-width");

const { CLICK } = require("../events");
const { prefix: PREFIX } = require("../config");

const MODAL_CLASSNAME = `${PREFIX}-modal`;
const MODAL_INNER_CLASSNAME = `${MODAL_CLASSNAME}__inner`;
const OVERLAY_CLASSNAME = `${MODAL_CLASSNAME}__overlay`;
const OPENER_ATTRIBUTE = "data-usa-modal";
const CLOSER_ATTRIBUTE = "data-close-modal";
const FORCE_ACTION_ATTRIBUTE = "data-force-action";
const MODAL = `.${MODAL_CLASSNAME}`;
const INITIAL_FOCUS = `${MODAL} *[data-focus]`;
const CLOSE_BUTTON = `${MODAL} *[${CLOSER_ATTRIBUTE}]`;
const OPENERS = `*[${OPENER_ATTRIBUTE}][aria-controls]`;
const CLOSERS = `${CLOSE_BUTTON}, .${OVERLAY_CLASSNAME}:not([${FORCE_ACTION_ATTRIBUTE}])`;

const ACTIVE_CLASS = "usa-js-mobile-nav--active";
const PREVENT_CLICK_CLASS = "usa-js-no-click";
const VISIBLE_CLASS = "is-visible";
const HIDDEN_CLASS = "is-hidden";

let modal;

const isActive = () => document.body.classList.contains(ACTIVE_CLASS);
const SCROLLBAR_WIDTH = ScrollBarWidth();

/**
 *  Is bound to escape key, closes modal when 
 */
const onMenuClose = () => {
  modal.toggleModal.call(modal, false);
};

/**
 *  Toggle the visibility of a modal window
 *
 * @param {KeyboardEvent} event the keydown event
 * @returns {boolean} safeActive if mobile is open
 */
function toggleModal(event) {
  let originalOpener;
  let clickedElement = event.target;
  const { body } = document;
  const safeActive = !isActive();
  const modalId = clickedElement ? clickedElement.getAttribute("aria-controls") : document.querySelector(".usa-modal.is-visible");
  const targetModal = safeActive ? document.getElementById(modalId) : document.querySelector(".usa-modal.is-visible");
  const openFocusEl = targetModal.querySelector(INITIAL_FOCUS) ? targetModal.querySelector(INITIAL_FOCUS) : targetModal.querySelector(".usa-modal__inner");
  const returnFocus = document.getElementById(targetModal.getAttribute("data-opener"));
  const menuButton = body.querySelector(OPENERS);
  const forceUserAction = targetModal.getAttribute(FORCE_ACTION_ATTRIBUTE);

  // Sets the clicked element to the close button
  // so esc key always closes modal
  if (event.type === "keydown" && targetModal !== null) {
    clickedElement = targetModal.querySelector(CLOSE_BUTTON)
  }

  // When we're not hitting the escape key…
  if (clickedElement) {
    event.preventDefault();

    // Make sure we click the opener
    // If it doesn't have an ID, make one
    // Store id as data attribute on modal
    if (clickedElement.hasAttribute(OPENER_ATTRIBUTE)) {
      if (this.getAttribute("id") === null) {
        originalOpener = `modal-${Math.floor(Math.random() * 900000) + 100000}`;
        this.setAttribute("id", originalOpener);
      } 
      else {
        originalOpener = this.getAttribute("id");
      }
      targetModal.setAttribute("data-opener", originalOpener);
    }
   
    // This basically stops the propagation by determining if
    // the clicked element is not a child element in the modal
    // and is also not a close button.
    if (clickedElement.closest(`.${MODAL_INNER_CLASSNAME}`)) {
      if (clickedElement.hasAttribute(CLOSER_ATTRIBUTE)) {
        // do nothing. move on.
      }
      else {
        event.stopPropagation();
        event.preventDefault();
        return false;
      }
    }
  } 

  // Active class shares same as navigation
  body.classList.toggle(ACTIVE_CLASS, safeActive);
  targetModal.classList.toggle(VISIBLE_CLASS, safeActive);
  targetModal.classList.toggle(HIDDEN_CLASS, !safeActive);

  // If user is forced to take an action, adding
  // a class to the body that prevents clicking underneath
  // overlay
  if (forceUserAction){
    body.classList.toggle(PREVENT_CLICK_CLASS, safeActive);
  }

  // Account for content shifting from body overflow: hidden
  // We only check paddingRight in case apps are adding other properties
  // to the body element
  body.style.paddingRight = body.style.paddingRight === SCROLLBAR_WIDTH ? 0 : SCROLLBAR_WIDTH;

  // Handle the focus actions
  if (safeActive && openFocusEl) {
    // The modal window is opened. Focus is set to close button.

    // This if timeout could be fractal weirdness
    // in safari. But gives element a chance to appear
    // before setting focus.
    setTimeout(() => openFocusEl.focus(), 10);

    // Enables the escape if we're not forcing
    // the user to take an action
    if (forceUserAction){
      modal.focusTrap = FocusTrap(targetModal);
    }
    else {
      modal.focusTrap = FocusTrap(targetModal, {
        Escape: onMenuClose,
      });
    }
    modal.focusTrap.update(safeActive);
  } else if (
    !safeActive &&
    menuButton &&
    returnFocus
  ) {
    // The modal window is closed.
    // Focus is returned to the opener
    returnFocus.focus();
    modal.focusTrap.update(safeActive);
  }

  return safeActive;
};

/**
 *  Builds modal window from base HTML
 *
 * @param {HTMLElement} baseComponent the modal html in the DOM
 */
const setUpAttributes = (baseComponent) => {
  const modalContent = baseComponent;
  const modalParent = document.createElement('div');
  const overlayDiv = document.createElement('div');
  const modalID = baseComponent.getAttribute("id");
  const ariaLabelledBy = baseComponent.getAttribute("aria-labelledby");
  const ariaDescribedBy = baseComponent.getAttribute("aria-describedby");
  const forceUserAction = baseComponent.hasAttribute(FORCE_ACTION_ATTRIBUTE);
  const modalClosers = modalParent.querySelectorAll(CLOSERS);

  // Rebuild the modal element
  modalContent.parentNode.insertBefore(modalParent, modalContent);
  modalParent.appendChild(modalContent);
  modalContent.parentNode.insertBefore(overlayDiv, modalContent);
  overlayDiv.appendChild(modalContent);

  // Add classes and attributes
  modalParent.classList.add(HIDDEN_CLASS);
  modalParent.classList.add(MODAL_CLASSNAME);
  overlayDiv.classList.add(OVERLAY_CLASSNAME);
  modalContent.classList.remove(MODAL_CLASSNAME);
  modalContent.classList.add(MODAL_INNER_CLASSNAME);
  
  modalParent.setAttribute("role", "dialog");
  modalParent.setAttribute("id", modalID);

  if (ariaLabelledBy) {
    modalParent.setAttribute("aria-labelledby", ariaLabelledBy);
  }

  if (ariaDescribedBy) {
    modalParent.setAttribute("aria-describedby", ariaDescribedBy);
  }

  if (forceUserAction) {
    overlayDiv.setAttribute(FORCE_ACTION_ATTRIBUTE, "true");
    modalParent.setAttribute(FORCE_ACTION_ATTRIBUTE, "true");
  }
  

  // Update the base element HTML
  baseComponent.removeAttribute("id");
  baseComponent.removeAttribute("aria-labelledby");
  baseComponent.removeAttribute("aria-describedby");
  baseComponent.setAttribute("tabindex", "-1");

  // Add aria-controls
  select(modalClosers).forEach((el) => {
    el.setAttribute("aria-controls", modalID);
  }); 
}

modal = behavior(
  {
    [CLICK]: {
      [OPENERS]: toggleModal,
      [CLOSERS]: toggleModal,
    },
  },
  {
    init(root) {
      select(MODAL, root).forEach((modalWindow) => {
        setUpAttributes(modalWindow);
      });   
    },
    focusTrap: null,
    toggleModal,
  }
);

module.exports = modal;