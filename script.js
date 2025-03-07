import { awards } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis({
    autoRaf: true,
  });

  const awardsListContainer = document.querySelector(".awards-list");
  const awardPreview = document.querySelector(".award-preview");
  const awardsList = document.querySelector(".awards-list");

  const POSITIONS = {
    BOTTOM: 0,
    MIDDLE: -80,
    TOP: -160,
  };

  let lastMousePosition = { x: 0, y: 0 };
  let activeAward = null;
  let ticking = false;
  let mouseTimeout = null;
  let isMouseMoving = false;

  // Create award elements
  awards.forEach((award) => {
    const awardElement = document.createElement("div");
    awardElement.className = "award";

    awardElement.innerHTML = `
      <div class="award-wrapper">
        <div class="award-name">
          <h1>${award.name}</h1>
        </div>
        <div class="award-project">
          <h1>${award.project}</h1>
        </div>
        <div class="award-name">
          <h1>${award.name}</h1>
        </div>
      </div>
    `;

    awardsListContainer.appendChild(awardElement);
  });

  const awardsElements = document.querySelectorAll(".award");

  // Animation functions - Debounced for better performance
  const animatePreview = () => {
    const awardsListRect = awardsList.getBoundingClientRect();
    if (
      lastMousePosition.x < awardsListRect.left ||
      lastMousePosition.x > awardsListRect.right ||
      lastMousePosition.y < awardsListRect.top ||
      lastMousePosition.y > awardsListRect.bottom
    ) {
      const previewImages = awardPreview.querySelectorAll("img");
      previewImages.forEach((img) => {
        gsap.to(img, {
          scale: 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => img.remove(),
        });
      });
    }
  };

  // Use debounce for update function (better performance)
  const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  const updateAwards = () => {
    animatePreview();

    if (activeAward) {
      const rect = activeAward.getBoundingClientRect();
      const isStillOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (!isStillOver) {
        const wrapper = activeAward.querySelector(".award-wrapper");
        const leavingFromTop = lastMousePosition.y < rect.top + rect.height / 2;

        gsap.to(wrapper, {
          y: leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM,
          duration: 0.4,
          ease: "power2.out",
        });
        activeAward = null;
      }
    }

    // Performance improvement: Only check awards that are in viewport
    awardsElements.forEach((award) => {
      if (award === activeAward) return;

      const rect = award.getBoundingClientRect();
      // Skip awards outside viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      
      const isMouseOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (isMouseOver) {
        const wrapper = award.querySelector(".award-wrapper");
        gsap.to(wrapper, {
          y: POSITIONS.MIDDLE,
          duration: 0.4,
          ease: "power2.out",
        });
        activeAward = award;
      }
    });

    ticking = false;
  };

  // Throttled event handler for better performance
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Use throttled mousemove for better performance
  document.addEventListener("mousemove", throttle((e) => {
    lastMousePosition.x = e.clientX;
    lastMousePosition.y = e.clientY;

    isMouseMoving = true;
    if (mouseTimeout) {
      clearTimeout(mouseTimeout);
    }

    const awardsListRect = awardsList.getBoundingClientRect();
    const isInsideAwardsList =
      lastMousePosition.x >= awardsListRect.left &&
      lastMousePosition.x <= awardsListRect.right &&
      lastMousePosition.y >= awardsListRect.top &&
      lastMousePosition.y <= awardsListRect.bottom;

    if (isInsideAwardsList) {
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false;
        const images = awardPreview.querySelectorAll("img");
        if (images.length > 1) {
          const lastImage = images[images.length - 1];
          images.forEach((img) => {
            if (img !== lastImage) {
              gsap.to(img, {
                scale: 0,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => img.remove(),
              });
            }
          });
        }
      }, 2000);
    }

    if (!ticking) {
      requestAnimationFrame(() => {
        updateAwards();
      });
      ticking = true;
    }
  }, 50)); // 50ms throttle

  // Throttled scroll event for performance
  document.addEventListener(
    "scroll",
    throttle(() => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateAwards();
        });
        ticking = true;
      }
    }, 100), // 100ms throttle
    { passive: true }
  );

  // Award hover effects - same for mobile and desktop
  awardsElements.forEach((award, index) => {
    const wrapper = award.querySelector(".award-wrapper");
    let currentPosition = POSITIONS.TOP;

    award.addEventListener("mouseenter", (e) => {
      activeAward = award;
      const rect = award.getBoundingClientRect();
      const enterFromTop = e.clientY < rect.top + rect.height / 2;

      if (enterFromTop || currentPosition === POSITIONS.BOTTOM) {
        currentPosition = POSITIONS.MIDDLE;
        gsap.to(wrapper, {
          y: POSITIONS.MIDDLE,
          duration: 0.4,
          ease: "power2.out",
        });
      }

      // Create a colored rectangle as a placeholder instead of an image
      const img = document.createElement("div");
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.backgroundColor = getColorForIndex(index);
      img.style.border = "1px solid #0A0A0A";
      img.style.borderRadius = "4px";
      img.style.transform = "scale(0)";
      img.style.zIndex = Date.now();
      img.style.display = "flex";
      img.style.justifyContent = "center";
      img.style.alignItems = "center";
      img.style.color = "#fff";
      img.style.fontSize = "16px";
      img.style.fontWeight = "bold";
      img.style.textTransform = "uppercase";
      img.textContent = award.querySelector(".award-name h1").textContent;
      
      // Add to DOM with a class for easier selection
      img.classList.add("preview-item");
      awardPreview.appendChild(img);

      gsap.to(img, {
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    award.addEventListener("mouseleave", (e) => {
      activeAward = null;
      const rect = award.getBoundingClientRect();
      const leavingFromTop = e.clientY < rect.top + rect.height / 2;

      currentPosition = leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM;
      gsap.to(wrapper, {
        y: currentPosition,
        duration: 0.4,
        ease: "power2.out",
      });
      
      // Remove preview after a short delay
      setTimeout(() => {
        const previewItems = awardPreview.querySelectorAll(".preview-item");
        previewItems.forEach(item => {
          gsap.to(item, {
            scale: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => item.remove()
          });
        });
      }, 300);
    });
  });
  
  // Helper function to generate colors based on index
  function getColorForIndex(index) {
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
      '#9b59b6', '#1abc9c', '#d35400', '#34495e'
    ];
    return colors[index % colors.length];
  }
});


// Optimize 3D model and animation for mobile
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);

// Use a more efficient ticker approach
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 3D scene setup with better performance for mobile
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Detect if device is mobile for performance adjustments
const isMobile = window.innerWidth <= 768;

// Lower quality renderer for mobile
const renderer = new THREE.WebGLRenderer({
  antialias: !isMobile, // Turn off antialiasing on mobile
  alpha: true,
  powerPreference: "low-power" // Better for mobile battery
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(isMobile ? 1 : window.devicePixelRatio); // Lower pixel ratio on mobile
renderer.shadowMap.enabled = !isMobile; // Disable shadows on mobile
renderer.physicallyCorrectLights = !isMobile; // Disable physically correct lights on mobile
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;

const modelContainer = document.querySelector(".model");
if (modelContainer) {
  modelContainer.appendChild(renderer.domElement);
}

// Simpler lighting for mobile
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

// Only add main light - reduce light sources for mobile
const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
mainLight.position.set(0.5, 7.5, 2.5);
scene.add(mainLight);

// Skip additional lights on mobile
if (!isMobile) {
  const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
  fillLight.position.set(-15, 0, -5);
  scene.add(fillLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
  hemiLight.position.set(0, 0, 0);
  scene.add(hemiLight);
}

let animationFrameId;
function basicAnimate() {
  animationFrameId = requestAnimationFrame(basicAnimate);
  renderer.render(scene, camera);
}
basicAnimate();

let model;
const loader = new THREE.GLTFLoader();
loader.load("./assets/chair.glb", function (gltf) {
  model = gltf.scene;
  
  // Simplify model for mobile
  model.traverse((node) => {
    if (node.isMesh) {
      if (node.material) {
        // Simplified materials for mobile
        node.material.metalness = isMobile ? 1 : 2;
        node.material.roughness = isMobile ? 2 : 3;
        node.material.envMapIntensity = isMobile ? 3 : 5;
        
        // Lower quality settings for mobile
        if (isMobile && node.material.map) {
          node.material.map.minFilter = THREE.LinearFilter;
          node.material.map.magFilter = THREE.LinearFilter;
          node.material.map.anisotropy = 1;
        }
      }
      // Disable shadows on mobile for performance
      node.castShadow = !isMobile;
      node.receiveShadow = !isMobile;
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  scene.add(model);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  camera.position.z = maxDim * 1.75;

  model.scale.set(0, 0, 0);
  model.rotation.set(0, 0.5, 0);
  playInitialAnimation();

  cancelAnimationFrame(animationFrameId);
  animate();
});

const floatAmplitude = isMobile ? 0.005 : 0.01; // Lower amplitude for mobile
const floatSpeed = isMobile ? 1 : 1.5; // Lower speed for mobile
const rotationSpeed = isMobile ? 0.2 : 0.3; // Lower rotation speed for mobile
let isFloating = true;
let currentScroll = 0;

const totalScrollHeight =
  document.documentElement.scrollHeight - window.innerHeight;

function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      ease: "power2.out",
    });
  }
}

lenis.on("scroll", (e) => {
  currentScroll = e.scroll;
});

// Optimize animation for better performance
let lastTime = 0;
const animateInterval = isMobile ? 50 : 16; // Lower frame rate on mobile (20fps vs 60fps)

function animate(time) {
  // Throttle animation frames on mobile
  if (isMobile && time - lastTime < animateInterval) {
    requestAnimationFrame(animate);
    return;
  }
  
  lastTime = time;
  
  if (model) {
    if (isFloating) {
      const floatOffset =
        Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
      model.position.y = floatOffset;
    }

    const scrollProgress = Math.min(currentScroll / totalScrollHeight, 1);

    const baseTilt = 0.5;
    // Reduce complexity of calculations for mobile
    model.rotation.x = scrollProgress * Math.PI * (isMobile ? 2 : 4) + baseTilt;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// lenis scroll - more efficient
function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// Optimize canvas trail for mobile
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
let pauseTrail = false;

// Set canvas position and style
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "99999"; 
canvas.style.pointerEvents = "none";
canvas.style.mixBlendMode = "difference";

// Optimize canvas resolution for mobile
function resizeCanvas() {
  // Get document dimensions
  const docHeight = Math.max(
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight,
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.body.clientHeight
  );
  
  const docWidth = Math.max(
    document.documentElement.scrollWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth,
    document.body.scrollWidth,
    document.body.offsetWidth,
    document.body.clientWidth
  );
  
  // Only update if dimensions are different
  if (canvas.width !== docWidth || canvas.height !== docHeight) {
    canvas.width = docWidth;
    canvas.height = docHeight;
    
    // Adjust line width for better mobile performance
    ctx.lineWidth = isMobile ? 12 : 24;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.54)";
    ctx.lineCap = "round";
    ctx.filter = isMobile ? "blur(6px)" : "blur(12px)"; // Less blur on mobile
  }
}

// Initial canvas sizing
resizeCanvas();

// Variables to track mouse and scroll position
let xMousePos = 0;
let yMousePos = 0;
let lastScrolledLeft = 0;
let lastScrolledTop = 0;
let lastX = null;
let lastY = null;
let hasMouseMoved = false;

// Simplified draw line for better performance
function drawLine(newX, newY) {
  if (pauseTrail) {
    lastX = newX;
    lastY = newY;
    return;
  }

  if (lastX !== null && lastY !== null) {
    // Skip drawing if the distance is very small (optimization)
    const dist = Math.sqrt(Math.pow(newX - lastX, 2) + Math.pow(newY - lastY, 2));
    if (dist < (isMobile ? 5 : 2)) return;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(newX, newY);
    ctx.stroke();
  }
  lastX = newX;
  lastY = newY;
}

// Setup face section event listeners
document.addEventListener("DOMContentLoaded", () => {
  const faceSection = document.querySelector('.footer');
  if (faceSection) {
    faceSection.addEventListener('mouseenter', () => {
      pauseTrail = true;
    });

    faceSection.addEventListener('mouseleave', () => {
      pauseTrail = false;
      lastX = null;
      lastY = null;
    });
  }
});

// Use throttled event listeners for mouse movement
document.addEventListener("mousemove", throttle(function (event) {
  // Only resize canvas periodically
  if (Math.random() < 0.1) resizeCanvas();
  
  if (!hasMouseMoved) {
    lastX = event.pageX;
    lastY = event.pageY;
    hasMouseMoved = true;
  } else {
    xMousePos = event.pageX;
    yMousePos = event.pageY;
    drawLine(xMousePos, yMousePos);
  }
}, isMobile ? 100 : 50)); // More aggressive throttling on mobile

// Throttled scroll handler
window.addEventListener("scroll", throttle(function () {
  // Only resize canvas periodically during scroll
  if (Math.random() < 0.1) resizeCanvas();
  
  const xScrollDelta = window.scrollX - lastScrolledLeft;
  const yScrollDelta = window.scrollY - lastScrolledTop;

  if (xScrollDelta !== 0 || yScrollDelta !== 0) {
    xMousePos += xScrollDelta;
    yMousePos += yScrollDelta;
    drawLine(xMousePos, yMousePos);
  }

  lastScrolledLeft = window.scrollX;
  lastScrolledTop = window.scrollY;
}, isMobile ? 200 : 100), { passive: true });

// Less frequent resize checks
window.addEventListener("resize", debounce(resizeCanvas, 250));

// More efficient mutation observer
const observer = new MutationObserver(debounce(function() {
  resizeCanvas();
}, 250));

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false // Don't observe all attribute changes
});

// Helper functions for performance optimization
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}