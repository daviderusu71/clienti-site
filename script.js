const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const track = document.querySelector("[data-track]");
const dotsContainer = document.querySelector("[data-dots]");
const prevButton = document.querySelector(".slider-button.prev");
const nextButton = document.querySelector(".slider-button.next");
const contactForm = document.querySelector(".contact-form");
const yearNode = document.getElementById("current-year");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const closeNavigation = () => {
  if (!siteNav || !navToggle) {
    return;
  }

  siteNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";

    navToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });
}

window.addEventListener("scroll", () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("scrolled", window.scrollY > 30);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (track && dotsContainer && prevButton && nextButton) {
  const slides = Array.from(track.children);
  let currentIndex = 0;
  let autoPlayId;

  const createDots = () => {
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
      dot.addEventListener("click", () => {
        updateSlider(index);
        restartAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });
  };

  const updateDots = () => {
    const dots = dotsContainer.querySelectorAll("button");
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  };

  const updateSlider = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  };

  const startAutoPlay = () => {
    autoPlayId = window.setInterval(() => {
      updateSlider(currentIndex + 1);
    }, 5000);
  };

  const stopAutoPlay = () => {
    window.clearInterval(autoPlayId);
  };

  const restartAutoPlay = () => {
    stopAutoPlay();
    startAutoPlay();
  };

  createDots();
  updateSlider(0);
  startAutoPlay();

  prevButton.addEventListener("click", () => {
    updateSlider(currentIndex - 1);
    restartAutoPlay();
  });

  nextButton.addEventListener("click", () => {
    updateSlider(currentIndex + 1);
    restartAutoPlay();
  });

  track.addEventListener("mouseenter", stopAutoPlay);
  track.addEventListener("mouseleave", startAutoPlay);
}

if (contactForm) {
  const statusNode = contactForm.querySelector(".form-status");
  const fields = {
    name: {
      input: contactForm.querySelector("#name"),
      validate: (value) => {
        if (value.trim().length < 2) {
          return "Please enter at least 2 characters.";
        }
        return "";
      },
    },
    email: {
      input: contactForm.querySelector("#email"),
      validate: (value) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value.trim())) {
          return "Please enter a valid email address.";
        }
        return "";
      },
    },
    message: {
      input: contactForm.querySelector("#message"),
      validate: (value) => {
        if (value.trim().length < 20) {
          return "Please share a little more detail about the project.";
        }
        return "";
      },
    },
  };

  const setFieldState = (input, message) => {
    const field = input.closest(".field");
    const errorNode = field.querySelector(".field-error");

    errorNode.textContent = message;
    input.classList.toggle("invalid", Boolean(message));
  };

  const validateField = (name) => {
    const field = fields[name];
    const message = field.validate(field.input.value);
    setFieldState(field.input, message);
    return !message;
  };

  Object.keys(fields).forEach((fieldName) => {
    const input = fields[fieldName].input;

    input.addEventListener("blur", () => validateField(fieldName));
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) {
        validateField(fieldName);
      }
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const isFormValid = Object.keys(fields).every((fieldName) => validateField(fieldName));

    if (!isFormValid) {
      statusNode.textContent = "Please fix the highlighted fields and try again.";
      statusNode.className = "form-status error";
      return;
    }

    statusNode.textContent = "Thanks. Your message has been sent successfully.";
    statusNode.className = "form-status success";
    contactForm.reset();

    Object.values(fields).forEach(({ input }) => {
      input.classList.remove("invalid");
      const field = input.closest(".field");
      field.querySelector(".field-error").textContent = "";
    });
  });
}
