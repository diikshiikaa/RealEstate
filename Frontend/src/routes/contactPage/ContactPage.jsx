import React from "react";
import "./contactPage.css";

const ContactPage = () => {
  return (
    <div class="new_home_web">
      <div class="responsive-container-block big-container">
        <img
          class="imgBG"
          src="https://workik-widget-assets.s3.amazonaws.com/widget-assets/images/aw65.png"
        />
        <div class="responsive-container-block textContainer">
          <div class="topHead">
            <p class="text-blk heading">
              Get in
              <span class="orangeText">touch</span>
            </p>
            <div class="orangeLine" id="w-c-s-bgc_p-2-dm-id"></div>
          </div>
          <p class="text-blk subHeading">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna al iqua.
          </p>
        </div>
        <div class="responsive-container-block container">
          <div
            class="responsive-cell-block wk-tab-12 wk-mobile-12 wk-desk-7 wk-ipadp-10 line"
            id="i69b"
          >
            <form class="form-box">
              <div class="container-block form-wrapper">
                <div class="responsive-container-block">
                  <div class="left4">
                    <div
                      class="responsive-cell-block wk-ipadp-6 wk-tab-12 wk-mobile-12 wk-desk-6"
                      id="i10mt-2"
                    >
                      <input
                        class="input"
                        id="ijowk-2"
                        name="FirstName"
                        placeholder="First Name"
                      />
                    </div>
                    <div class="responsive-cell-block wk-desk-6 wk-ipadp-6 wk-tab-12 wk-mobile-12">
                      <input
                        class="input"
                        id="indfi-2"
                        name="Last Name"
                        placeholder="Last Name"
                      />
                    </div>
                    <div class="responsive-cell-block wk-desk-6 wk-ipadp-6 wk-tab-12 wk-mobile-12">
                      <input
                        class="input"
                        id="ipmgh-2"
                        name="Email"
                        placeholder="Email Address"
                      />
                    </div>
                    <div class="responsive-cell-block wk-desk-6 wk-ipadp-6 wk-tab-12 wk-mobile-12 lastPhone">
                      <input
                        class="input"
                        id="imgis-2"
                        name="PhoneNumber"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                  <div
                    class="responsive-cell-block wk-tab-12 wk-mobile-12 wk-desk-12 wk-ipadp-12"
                    id="i634i-2"
                  >
                    <textarea
                      class="textinput"
                      id="i5vyy-2"
                      placeholder="Message"
                    ></textarea>
                  </div>
                </div>
                <a class="send" href="#" id="w-c-s-bgc_p-1-dm-id">
                  Send
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
