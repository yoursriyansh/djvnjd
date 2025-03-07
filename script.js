import { awards } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  // Detect if we're on mobile
  const isMobile = window.innerWidth <= 768;
  
  // Only initialize Lenis smooth scrolling on desktop
  const lenis = new Lenis({
    autoRaf: !isMobile, // Don't use on mobile
    smoothWheel: !isMobile
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

  // Only set up these animations on desktop
  if (!isMobile) {
    // Animation functions
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

      awardsElements.forEach((award) => {
        if (award === activeAward) return;

        const rect = award.getBoundingClientRect();
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

    // Event listeners - only add on desktop
    document.addEventListener("mousemove", (e) => {
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

      // Use throttling to prevent too many updates
      if (!ticking) {
        requestAnimationFrame(() => {
          updateAwards();
        });
        ticking = true;
      }
    });

    // Throttle scroll events
    let scrollTimeout;
    document.addEventListener(
      "scroll",
      () => {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
          if (!ticking) {
            requestAnimationFrame(() => {
              updateAwards();
            });
            ticking = true;
          }
          scrollTimeout = null;
        }, 100); // Throttle to 10 updates per second max
      },
      { passive: true }
    );

    // Award hover effects - only for desktop
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
  } else {
    // Mobile-specific simpler layout adjustments
    awardsElements.forEach((award) => {
      const wrapper = award.querySelector(".award-wrapper");
      gsap.set(wrapper, { y: POSITIONS.MIDDLE }); // Just show the middle state permanently
    });
  }
  
  // Helper function to generate colors based on index
  function getColorForIndex(index) {
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
      '#9b59b6', '#1abc9c', '#d35400', '#34495e'
    ];
    return colors[index % colors.length];
  }

  // Initialize 3D model only on desktop
  if (!isMobile) {
    initThreeJS();
  }
  
  // Setup scroll for desktop
  if (!isMobile) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    
    // Canvas trail only on desktop
    initCanvasTrail();
  }
});

// Helper function to initialize Three.js
function initThreeJS() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' // Prioritize performance
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Reduce pixel ratio for better performance
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  
  // Reduce shadow quality for better performance
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // Less expensive shadow mapping
  
  document.querySelector(".model").appendChild(renderer.domElement);

  // Simplified lighting - fewer lights for better performance
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 5.0);
  mainLight.position.set(0.5, 7.5, 2.5);
  scene.add(mainLight);

  let model;
  const loader = new THREE.GLTFLoader();
  loader.load("./assets/chair.glb", function (gltf) {
    model = gltf.scene;
    model.traverse((node) => {
      if (node.isMesh) {
        if (node.material) {
          // Simplify materials for better performance
          node.material.metalness = 1;
          node.material.roughness = 1;
          node.material.envMapIntensity = 1;
        }
        // Only enable shadows on larger objects
        if (node.geometry && node.geometry.boundingSphere && node.geometry.boundingSphere.radius > 1) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
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

    animate();
  });

  const floatAmplitude = 0.01;
  const floatSpeed = 1.0; // Slower animation
  let isFloating = true;
  let currentScroll = 0;
  
  const lenis = new Lenis();
  lenis.on("scroll", (e) => {
    currentScroll = e.scroll;
  });

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

  // Throttle the animation frame rate for better performance
  let lastTime = 0;
  const frameInterval = 1000 / 30; // Target 30 FPS instead of 60

  function animate(timestamp) {
    if (!timestamp) timestamp = 0;
    const elapsed = timestamp - lastTime;

    if (elapsed > frameInterval) {
      lastTime = timestamp - (elapsed % frameInterval);

      if (model) {
        if (isFloating) {
          const floatOffset =
            Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
          model.position.y = floatOffset;
        }

        const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = Math.min(currentScroll / totalScrollHeight, 1);

        const baseTilt = 0.5;
        model.rotation.x = scrollProgress * Math.PI * 2 + baseTilt; // Reduced complexity
      }

      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

// Helper function to initialize canvas trail
function initCanvasTrail() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let pauseTrail = false;

  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "99999"; 
  canvas.style.pointerEvents = "none";
  canvas.style.mixBlendMode = "difference";

  // Properly size the canvas but without triggering resize too often
  let resizeTimeout;
  function resizeCanvas() {
    if (resizeTimeout) return;
    
    resizeTimeout = setTimeout(() => {
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
      
      // Only update if dimensions are different to avoid clearing canvas unnecessarily
      if (canvas.width !== docWidth || canvas.height !== docHeight) {
        canvas.width = docWidth;
        canvas.height = docHeight;
        
        // Restore drawing settings
        ctx.lineWidth = 16; // Thinner line for better performance
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; // More transparent
        ctx.lineCap = "round";
        ctx.filter = "blur(8px)"; // Less blur for better performance
      }
      
      resizeTimeout = null;
    }, 250); // Throttle to max 4 times per second
  }

  resizeCanvas();

  let lastX = null;
  let lastY = null;
  let hasMouseMoved = false;
  
  // Throttle mouse movement
  let mouseMoveTimeout;
  document.addEventListener("mousemove", function (event) {
    if (mouseMoveTimeout) return;
    
    mouseMoveTimeout = setTimeout(() => {
      if (!hasMouseMoved) {
        lastX = event.pageX;
        lastY = event.pageY;
        hasMouseMoved = true;
      } else {
        // Draw line but only if mouse moved significantly
        const dx = Math.abs(event.pageX - lastX);
        const dy = Math.abs(event.pageY - lastY);
        
        if (dx > 5 || dy > 5) { // Only draw if moved at least 5px
          drawLine(event.pageX, event.pageY);
        }
      }
      
      mouseMoveTimeout = null;
    }, 16); // Limit to ~60fps
  });

  // Function to draw a line segment
  function drawLine(newX, newY) {
    // Make sure canvas is right size
    resizeCanvas();
    
    if (pauseTrail) {
      // Don't draw while over face, but update position
      lastX = newX;
      lastY = newY;
      return;
    }

    if (lastX !== null && lastY !== null) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(newX, newY);
      ctx.stroke();
    }
    lastX = newX;
    lastY = newY;
  }

  // Throttle scroll update
  let scrollTimeout;
  let lastScrollX = window.scrollX;
  let lastScrollY = window.scrollY;
  
  window.addEventListener("scroll", function () {
    if (scrollTimeout) return;
    
    scrollTimeout = setTimeout(() => {
      const xScrollDelta = window.scrollX - lastScrollX;
      const yScrollDelta = window.scrollY - lastScrollY;

      if (Math.abs(xScrollDelta) > 5 || Math.abs(yScrollDelta) > 5) {
        if (lastX !== null && lastY !== null) {
          drawLine(lastX + xScrollDelta, lastY + yScrollDelta);
        }
      }

      lastScrollX = window.scrollX;
      lastScrollY = window.scrollY;
      scrollTimeout = null;
    }, 50); // Limit to 20 updates per second
  });

  // Set up face section event listeners
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

  // Handle window resizing
  window.addEventListener("resize", resizeCanvas);

  // Less frequent canvas checks (1 per second instead of constant)
  setInterval(resizeCanvas, 1000);
}
