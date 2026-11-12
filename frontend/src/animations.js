import { gsap } from "gsap";

const heroText = gsap.timeline();

heroText.from(".leftText", {
    opacity: 0,
    duration: 2,
    delay: 5
})
heroText.from(".rightText", {
    opacity: 0,
    duration: 2,
})

const moduleDivs = document.querySelectorAll(".module-div");

moduleDivs.forEach((div) => {
  const moduleImg = div.querySelector(".module-img");

  div.addEventListener("mouseenter", () => {
    gsap.to(moduleImg, {
      left: "0%",
      duration: 0.6,
      ease: "power2.out"
    });
  });

  div.addEventListener("mouseleave", () => {
    gsap.to(moduleImg, {
      left: "-100%",
      duration: 0.6,
      ease: "power2.in"
    });
  });
});

const cursor = document.querySelector(".custom-cursor");

window.addEventListener("mousemove", e => {
  gsap.to(cursor, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.5, 
    ease: "power3.out"
  });
});

