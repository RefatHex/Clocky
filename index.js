// a16.js
window.addEventListener("DOMContentLoaded", () => {
  const clock = new Clock(".clock");
  const dateElement = document.getElementById("dateElement");
  clock.setDateElement(dateElement);
});

class Clock {
  constructor(selector) {
    this.clockContainer = document.querySelector(selector);
    this.init();
  }

  init() {
    this.timeUpdate();
  }

  get timeAsObject() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return { hours, minutes, seconds };
  }

  get timeAsString() {
    const [hours, minutes, seconds, ampm] = this.timeDigits;
    return `${hours}:${minutes}:${seconds} ${ampm}`.trim();
  }

  get timeDigits() {
    let { hours, minutes, seconds } = this.timeAsObject;

    const ampm = hours > 11 ? "PM" : "AM";
    if (hours > 12) hours -= 12;

    const hourDigits = `${hours}`;
    const minuteDigits = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const secondDigits = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return [hourDigits, minuteDigits, secondDigits, ampm];
  }

  animateSecondHand() {
    const time = this.timeAsObject;
    const minuteFraction = time.seconds / 60;
    const angleB = Utils.roundToDecimalPlaces(360 * minuteFraction, 3);
    const angleA = angleB - 6;
    const duration = 300;
    const easing = "cubic-bezier(0.65,0,0.35,1)";
    const handEl = this.clockContainer?.querySelectorAll("[data-unit]")[2];

    handEl?.animate(
      [
        { transform: `rotate(${angleA}deg)` },
        { transform: `rotate(${angleB}deg)` },
      ],
      { duration, easing }
    );

    const numbers = handEl.children;
    for (let n = 0; n < numbers.length; ++n) {
      const translateY = -100 * (n + 1);
      numbers[n].animate(
        [
          { transform: `translateY(${translateY}%) rotate(${-angleA}deg)` },
          { transform: `translateY(${translateY}%) rotate(${-angleB}deg)` },
        ],
        { duration, easing }
      );
    }
  }

  timeUpdate() {
    this.clockContainer?.setAttribute("title", this.timeAsString);
    const time = this.timeAsObject;
    const minuteFraction = time.seconds / 60;
    const hourFraction = (time.minutes + minuteFraction) / 60;
    const twelveHourFraction = ((time.hours % 12) + hourFraction) / 12;

    const angles = [
      {
        prop: "--secAngle",
        value: Utils.roundToDecimalPlaces(360 * minuteFraction, 3),
      },
      {
        prop: "--minAngle",
        value: Utils.roundToDecimalPlaces(360 * hourFraction, 3),
      },
      {
        prop: "--hrAngle",
        value: Utils.roundToDecimalPlaces(360 * twelveHourFraction, 3),
      },
    ];

    for (let angle of angles) {
      this.clockContainer?.style.setProperty(angle.prop, `${angle.value}deg`);
    }

    const digits = this.timeDigits;
    for (let d = 0; d < digits.length; ++d) {
      const unitEl = this.clockContainer?.querySelectorAll("[data-unit]")[d];
      if (unitEl) {
        const numbers = unitEl.children;
        for (let n = 0; n < numbers.length; ++n) {
          numbers[n].textContent = digits[d];
        }
      }
    }

    this.animateSecondHand();

    clearTimeout(this.timeUpdateLoop);
    this.timeUpdateLoop = setTimeout(this.timeUpdate.bind(this), 1000);
  }

  setDateElement(dateElement) {
    this.dateElement = dateElement;
    this.updateDate();
  }

  updateDate() {
    const currentDate = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = currentDate.toLocaleDateString("en-US", options);
    this.dateElement.textContent = formattedDate;
  }
}

class Utils {
  static roundToDecimalPlaces(number, decimalPlaces) {
    return Math.round(number * 10 ** decimalPlaces) / 10 ** decimalPlaces;
  }
}
