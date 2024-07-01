describe("Main Script Tests", function() {
    let dropdownMenuToggler;
    let swiperSpy;

    beforeEach(function() {

        // Set up the DOM for testing
        document.body.innerHTML = `
          <div class="nav-dropdown">
            <div class="nav-item">
              <a class="nav-link">Dropdown</a>
            </div>
          </div>
          <div class="testimonial-slider"></div>
          <div class="testimonial-slider-pagination"></div>
        `;
    
        // Select the dropdown menu togglers
        dropdownMenuToggler = document.querySelectorAll(".nav-dropdown > .nav-item > .nav-link");
    
        // Spy on the Swiper constructor
        swiperSpy = sinon.spy(global, "Swiper");
    
        // Run the main script
        (function () {
          "use strict";
    
          // Dropdown Menu Toggler For Mobile
          // ----------------------------------------
          dropdownMenuToggler.forEach((toggler) => {
            toggler?.addEventListener("click", (e) => {
              e.target.closest('.nav-item').classList.toggle("active");
            });
          });
    
          // Testimonial Slider
          // ----------------------------------------
          new Swiper(".testimonial-slider", {
            spaceBetween: 24,
            loop: true,
            pagination: {
              el: ".testimonial-slider-pagination",
              type: "bullets",
              clickable: true,
            },
            breakpoints: {
              768: {
                slidesPerView: 2,
              },
              992: {
                slidesPerView: 3,
              },
            },
          });
        })();
      });

    afterEach(function() {
        // Restore the original Swiper constructor
        swiperSpy.restore();
    });

    it("should toggle 'active' class on nav-item when nav-link is clicked", function() {
        const navLink = dropdownMenuToggler[0];
        const navItem = navLink.closest('.nav-item');
    
        expect(navItem.classList.contains('active')).toBe(false);
        navLink.click();
        expect(navItem.classList.contains('active')).toBe(true);
        navLink.click();
        expect(navItem.classList.contains('active')).toBe(false);
    });

    it("should initialize Swiper with the correct configuration", function() {
        expect(swiperSpy.calledOnce).toBe(true);
        expect(swiperSpy.calledWith(".testimonial-slider")).toBe(true);
    
        const swiperConfig = swiperSpy.firstCall.args[1];
        expect(swiperConfig).toEqual(jasmine.objectContaining({
          spaceBetween: 24,
          loop: true,
          pagination: {
            el: ".testimonial-slider-pagination",
            type: "bullets",
            clickable: true,
          },
          breakpoints: {
            768: {
              slidesPerView: 2,
            },
            992: {
              slidesPerView: 3,
            },
          }}));
        });
});
  