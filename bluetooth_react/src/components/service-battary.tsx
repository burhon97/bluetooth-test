import React from "react";

export function ServiceBattary() {
  let bluetoothDevice: any;
  let batteryLevelCharacteristic: any;

  async function onReadBatteryLevelButtonClick() {
    try {
      if (!bluetoothDevice) {
        await requestDevice();
      }
      await connectDeviceAndCacheCharacteristics();

      console.log("Reading Battery Level...");
      await batteryLevelCharacteristic.readValue();
    } catch (error) {
      console.log("Argh! " + error);
    }
  }

  async function requestDevice() {
    console.log("Requesting any Bluetooth Device...");
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      // filters: [...] <- Prefer filters to save energy & show relevant devices.
      acceptAllDevices: true,
      optionalServices: ["battery_service"],
    });
    bluetoothDevice.addEventListener("gattserverdisconnected", onDisconnected);
  }

  async function connectDeviceAndCacheCharacteristics() {
    if (bluetoothDevice.gatt.connected && batteryLevelCharacteristic) {
      return;
    }

    console.log("Connecting to GATT Server...");
    const server = await bluetoothDevice.gatt.connect();

    console.log("Getting Battery Service...");
    const service = await server.getPrimaryService("battery_service");

    console.log("Getting Battery Level Characteristic...");
    batteryLevelCharacteristic = await service.getCharacteristic(
      "battery_level"
    );

    batteryLevelCharacteristic.addEventListener(
      "characteristicvaluechanged",
      handleBatteryLevelChanged
    );
  }

  function handleBatteryLevelChanged(event: any) {
    let batteryLevel = event.target.value.getUint8(0);
    console.log("> Battery Level is " + batteryLevel + "%");
  }

  async function onStartNotificationsButtonClick() {
    try {
      console.log("Starting Battery Level Notifications...");
      await batteryLevelCharacteristic.startNotifications();

      console.log("> Notifications started");
    } catch (error) {
      console.log("Argh! " + error);
    }
  }

  async function onStopNotificationsButtonClick() {
    try {
      console.log("Stopping Battery Level Notifications...");
      await batteryLevelCharacteristic.stopNotifications();

      console.log("> Notifications stopped");
    } catch (error) {
      console.log("Argh! " + error);
    }
  }

  function onResetButtonClick() {
    if (batteryLevelCharacteristic) {
      batteryLevelCharacteristic.removeEventListener(
        "characteristicvaluechanged",
        handleBatteryLevelChanged
      );
      batteryLevelCharacteristic = null;
    }
    // Note that it doesn't disconnect device.
    bluetoothDevice = null;
    console.log("> Bluetooth Device reset");
  }

  async function onDisconnected() {
    console.log("> Bluetooth Device disconnected");
    try {
      await connectDeviceAndCacheCharacteristics();
    } catch (error) {
      console.log("Argh! " + error);
    }
  }

  return (
    <div>
      <button onClick={onReadBatteryLevelButtonClick}>
        Read Battery Level Device
      </button>
      <button onClick={onStartNotificationsButtonClick}>
        Start Notification Device
      </button>
      <button onClick={onStopNotificationsButtonClick}>
        Stop Notification Device
      </button>
      <button onClick={onResetButtonClick}>Reset Device</button>
    </div>
  );
}
