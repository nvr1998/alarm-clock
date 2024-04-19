let alarms = LS_GetAlarms(); // Retriving alarms from local storage // Retuns [] if there is none stored.
let totalAlarms = LS_GetTotalAlarmCount(); // Retriving total alarms from local storage // Retuns 0 if there is none stored.

// Alarm Object
class Alarm {
  constructor(alarmID, hours, minutes, time, songID, toggled) {
    this.alarmID = alarmID;
    this.time = time;
    this.hours = hours;
    this.minutes = minutes;
    this.songID = songID;
    this.toggled = toggled;
    this.triggered = false;
  }
}

// Loads Alarms and starts a timer once the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  InitialiseAlarms();
  CheckForNoAlarm();
  const main_timer = document.getElementById("time");
  const time_suffix = document.getElementById("time-suffix");
  const dateText = document.getElementById("date");

  let now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  dateText.textContent = formattedDate + " " + getOrdinalSuffix(now.day);
  main_timer.textContent = GetTimeNoAMPM(GetTime());
  time_suffix.textContent = GetTimeSuffix(GetTime());
  let millisecs = 1000 - now.getMilliseconds();
  setInterval(function () {
    main_timer.textContent = GetTimeNoAMPM(GetTime());
    time_suffix.textContent = GetTimeSuffix(GetTime());
  }, millisecs);
});

// Adds loaded alarms into the page
function InitialiseAlarms() {
  for (let i = 0; i < alarms.length; i++) {
    AddAlarm(alarms[i]);
  }
}

// Suffix for the day
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th"; // handles 4th to 20th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// Adds alarm with a template-literal
function AddAlarm(alarm) {
  const alarm_list_view = document.querySelector(".alarm-list-view");
  const alarmDOM = `<div data-alarmid=${alarm.alarmID} class="alarm-data">
  <p class="alarm-time ${alarm.toggled ? "active" : ""}">${alarm.time}</p>
  <div class="alarm-buttons">
    <button onclick="ToggleAlarm(this)" class="alarm-button ${
      alarm.toggled ? "active" : ""
    }">
      <div class="toggle-circle ${alarm.toggled ? "active" : ""}"></div>
    </button>
    <button onclick="DeleteAlarm(this)" class="alarm-edit">
      <span class="material-symbols-rounded" id="edit-button">
        delete
      </span>
    </button>
  </div>
</div>`;
  alarm_list_view.innerHTML += alarmDOM;
}

// Toggling the add alarm popup window
function ToggleAlarmWindow() {
  const alarm_edit_window = document.querySelector(".alarm-popup-container");

  alarm_edit_window.classList.toggle("active");

  if (alarm_edit_window.classList.contains("active")) {
    const time_input = document.getElementById("input-time");

    let timeVal = "06:00";
    time_input.value = timeVal;
  }
}

// Toggling the alarm to be active or not-active
function ToggleAlarm(element) {
  element.classList.toggle("active");
  element.querySelector(".toggle-circle").classList.toggle("active");
  element
    .closest(".alarm-data")
    .querySelector(".alarm-time")
    .classList.toggle("active");
  let alarm_ID = element.closest(".alarm-data").dataset.alarmid;
  alarms[alarm_ID].toggled = !alarms[alarm_ID].toggled;
  LS_SaveAlarms();
}
function ToggleAlarmID(id) {
  const targetAlarm = document.querySelector(`div[data-alarmid="${id}"]`);
  const alarm_button = targetAlarm.querySelector(".alarm-button");
  ToggleAlarm(alarm_button);
}

// Removes alarm from the list and also from the web page
function DeleteAlarm(element) {
  StopTimer();
  if (alarms.length > 0) {
    let alarm_ID = element.closest(".alarm-data").dataset.alarmid;
    console.log("Deleting " + alarm_ID);
    let lastAlarmItem = alarms[alarms.length - 1];
    let removingAlarmItem = alarms[alarm_ID];
    alarms[alarm_ID] = lastAlarmItem;
    alarms[alarm_ID].alarmID = alarm_ID;
    alarms[alarms.length - 1] = removingAlarmItem;

    const modified_alarm = document.querySelector(
      `div[data-alarmid="${alarms.length - 1}"]`
    );
    modified_alarm.setAttribute("data-alarmid", alarm_ID);
    totalAlarms--;
    element.closest(".alarm-data").remove();

    alarms.pop();

    LS_SaveAlarms();
    LS_SaveTotalAlarmCount();
  }
  CheckForNoAlarm();
  StartTimer();
}

// Creates a new alarm object and shows onto the web-page
function ConfirmAlarm() {
  const time_input = document.getElementById("input-time");
  const song_input = document.getElementById("input-song");
  let timeVals = time_input.value.split(":");
  let hours = parseInt(timeVals[0]);
  let mins = parseInt(timeVals[1]);
  let new_alarm = new Alarm(
    totalAlarms,
    hours,
    mins,
    GetTimeInAMPM(time_input.value),
    song_input.value,
    true
  );
  AddAlarm(new_alarm);
  alarms.push(new_alarm);
  totalAlarms++;
  CheckForNoAlarm();
  LS_SaveAlarms();
  LS_SaveTotalAlarmCount();
  ToggleAlarmWindow();
}

// Helper function to get time with correct Suffix
function GetTimeInAMPM(timeVal) {
  let timeVals = timeVal.split(":");
  let hours = parseInt(timeVals[0]);
  let mins = formatNumber(parseInt(timeVals[1]));
  let suffix = "AM";
  if (hours > 12) {
    suffix = "PM";
    hours = formatNumber(hours - 12);
  }
  if (hours === 0) {
    hours = formatNumber(12);
  }
  return hours + ":" + mins + ` ${suffix}`;
}
function GetTimeNoAMPM(timeVal) {
  let timeVals = timeVal.split(":");
  let hours = parseInt(timeVals[0]);
  let mins = formatNumber(parseInt(timeVals[1]));

  if (hours > 12) {
    hours = formatNumber(hours - 12);
  }
  if (hours === 0) {
    hours = formatNumber(12);
  }
  return hours + ":" + mins;
}
function GetTimeSuffix(timeVal) {
  let timeVals = timeVal.split(":");
  let hours = parseInt(timeVals[0]);
  let suffix = "AM";
  if (hours > 12) {
    suffix = "PM";
  }

  return suffix;
}

function GetTime() {
  let now = new Date();
  return now.getHours() + ":" + now.getMinutes();
}
function GetTimePadstart() {
  let now = new Date();
  return formatNumber(now.getHours()) + ":" + formatNumber(now.getMinutes());
}

function formatNumber(number) {
  return number.toString().padStart(2, "0");
}

let checkAlarmsInterval;
StartTimer();

// This timer checks for alarms to be triggered
function StartTimer() {
  checkAlarmsInterval = setInterval(function () {
    let now = new Date();
    for (let i = 0; i < alarms.length; i++) {
      if (
        now.getHours() === alarms[i].hours &&
        now.getMinutes() === alarms[i].minutes &&
        !alarms[i].triggered
      ) {
        alarms[i].triggered = true;
        LS_SaveAlarms();
        PlayAlarm(getOptionTextByValue("input-song", alarms[i].songID));
        swal("Alarm Triggered!").then(() => {
          StartTimer();
          StopAlarm();
        });
        StopTimer();
      }
    }
  }, 1000);
}

function StopTimer() {
  clearInterval(checkAlarmsInterval);
}

function getOptionTextByValue(selectId, value) {
  var selectElement = document.getElementById(selectId);
  var optionElement = selectElement.querySelector(`option[value="${value}"]`);
  if (optionElement) {
    return optionElement.textContent;
  }
  return null;
}

function PlayAlarm(alarmSoundName) {
  const audio_element = document.getElementById("alarm-audio");
  audio_element.setAttribute("src", alarmSoundName + ".mp3");
  audio_element.play();
}

function StopAlarm() {
  const audio_element = document.getElementById("alarm-audio");
  audio_element.pause();
  audio_element.currentTime = 0;
}

// Local Storage Helper Functions

function LS_GetAlarms() {
  if (localStorage.getItem("alarms")) {
    return JSON.parse(localStorage.getItem("alarms"));
  } else {
    localStorage.setItem("alarms", JSON.stringify([]));
    return [];
  }
}

function LS_SaveAlarms() {
  localStorage.setItem("alarms", JSON.stringify(alarms));
}

function LS_GetTotalAlarmCount() {
  if (localStorage.getItem("alarmCount")) {
    return parseInt(localStorage.getItem("alarmCount", 0));
  } else {
    localStorage.setItem("alarmCount", 0);
    return 0;
  }
}

function LS_SaveTotalAlarmCount() {
  localStorage.setItem("alarmCount", totalAlarms.toString());
}

// Checks if there are no alarms and displays a no alarm message
function CheckForNoAlarm() {
  const noAlarmIndic = document.getElementById("no-alarms-indocator");
  if (alarms.length === 0) {
    noAlarmIndic.style.display = "block";
  } else {
    noAlarmIndic.style.display = "none";
  }
}
