<template>
  <footer>
    <div class="container">
      <div class="d-flex justify-content">
        <div class="mr-auto p-2 mt-2">
          <div>
            <h5>Šachy Kuřim</h5>
            <p class="footer-desc">stránky šachového klubu</p>
          </div>
        </div>
        <div class="p-2 m-2">
          <div>
            <ul class="list-unstyled">
              <li class="m-1">
                <i class="pi pi-phone" style="font-size: 1rem"></i>
                <span class="ml-2">+420 123 456 789</span>
              </li>
              <li class="m-1">
                <i class="pi pi-at" style="font-size: 1rem"></i>
                <span class="ml-2"><a href="#">sachy-kurim@seznam.cz</a></span>
              </li>
              <li class="m-1">
                <i class="pi pi-map" style="font-size: 1rem"></i>
                <span class="ml-2">Legionářská 789, Kuřim</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="map m-1">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d10406.567885095757!2d16.533694!3d49.302125!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47129014965423af%3A0x9d1583f2f5b2cc05!2zRMWvbSBkxJt0w60gYSBtbMOhZGXFvmUgS3XFmWltLCBwxZnDrXNwxJt2a292w6Egb3JnYW5pemFjZQ!5e0!3m2!1scs!2sus!4v1680013653344!5m2!1scs!2sus"
            width="450"
            height="132"
            style="border: 0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  </footer>
</template>

<style>
footer {
  margin: auto;
  background-color: #3e3e3e;
  color: rgb(214, 212, 212);
}

footer a {
  color: goldenrod;
}
</style>
