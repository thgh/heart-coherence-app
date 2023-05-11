async requestPort() {
    const port = navigator.serial.requestPort();
    console.log(port);
  },
  async requestDevice() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ["heart_rate"] },
          {
            namePrefix: "H",
          },
        ],
        optionalServices: [
          "battery_service",
          0x2a98,
          0x2a9d,
          0x2a9e,
          "heart_rate",
          "device_information",
        ],
        //acceptAllDevices: true
      });
      console.log("requested", device, Object.keys(device));
      this.device = device;
      device.onadvertisementreceived = (evt) => {
        console.log("aaadvertisementreceived", evt);
        this.events.push(["aaadvertisementreceived", evt]);
      };
      device.ongattserverdisconnected = (evt) => {
        console.log("gggattserverdisconnected", evt);
        this.events.push(["gggattserverdisconnected", evt]);
      };
      console.log("watch", !!device.watchAdvertisements);
      await device.watchAdvertisements?.();
      console.log("watching");

      this.connect(device);

      this.error = null;
    } catch (error) {
      this.error = error;
    }
  },
  async getDevices() {
    try {
      this.devices = await navigator.bluetooth.getDevices();
      this.error = null;
    } catch (e) {
      this.error = e;
    }
  },
  async watchAdvertisements(device) {
    this.watched = await device.watchAdvertisements();
  },
  async connect(device) {
    try {
      const server = await device.gatt.connect();
      console.log("server", server);

      const service = await server.getPrimaryService(
        "device_information"
      );
      console.log("device_information service", service);

      const services = await server
        .getPrimaryServices()
        .catch((err) => ({ err }));

      for (const service of services) {
        switch (service.uuid) {
          case BluetoothUUID.getService("weight_scale"):
            log("s# weight_scale service ");
            console.log("weight_scale service", service);
            break;
          case BluetoothUUID.getService("device_information"):
            log("s# device_information service ");
            console.log("device_information service", service);
            break;
          case BluetoothUUID.getService("battery_service"):
            log("s# battery_service service ");
            console.log("battery_service service", service);
            break;
          case BluetoothUUID.getService("heart_rate"):
            log("s# heart_rate service ");
            console.log("heart_rate service", service);
            break;
          default:
            log("s# Other service " + service.uuid);
            console.log("other service", service.uuid, service);
            break;
        }
      }
      console.log("getPrimaryServices", services);
      this.services = services;

      log("Getting Device Information Characteristics...");
      //const characteristics = await service.getCharacteristics();
      const characteristics = (
        await Promise.all(
          services.slice(2).map((s) => s.getCharacteristics())
        )
      ).flat();

      const decoder = new TextDecoder("utf-8");
      for (const characteristic of characteristics) {
        let interesting = false;

        characteristic.addEventListener("data", (evt) =>
          console.log("data", evt)
        );

        await new Promise((a) => setTimeout(a, 100));
        switch (characteristic.uuid) {
          case BluetoothUUID.getCharacteristic(
            "manufacturer_name_string"
          ):
            await characteristic.readValue().then((value) => {
              log(
                "c> Manufacturer Name String: " + decoder.decode(value)
              );
            });
            break;

          case BluetoothUUID.getCharacteristic("model_number_string"):
            await characteristic.readValue().then((value) => {
              log("c> Model Number String: " + decoder.decode(value));
            });
            break;

          case BluetoothUUID.getCharacteristic(
            "hardware_revision_string"
          ):
            await characteristic.readValue().then((value) => {
              log(
                "c> Hardware Revision String: " + decoder.decode(value)
              );
            });
            break;

          case BluetoothUUID.getCharacteristic(
            "firmware_revision_string"
          ):
            await characteristic.readValue().then((value) => {
              log(
                "c> Firmware Revision String: " + decoder.decode(value)
              );
            });
            break;

          case BluetoothUUID.getCharacteristic(
            "software_revision_string"
          ):
            await characteristic.readValue().then((value) => {
              log(
                "c> Software Revision String: " + decoder.decode(value)
              );
            });
            break;

          case BluetoothUUID.getCharacteristic("system_id"):
            await characteristic.readValue().then((value) => {
              log("c> System ID: ");
              log(
                "  > Manufacturer Identifier: " +
                  padHex(value.getUint8(4)) +
                  padHex(value.getUint8(3)) +
                  padHex(value.getUint8(2)) +
                  padHex(value.getUint8(1)) +
                  padHex(value.getUint8(0))
              );
              log(
                "  > Organizationally Unique Identifier: " +
                  padHex(value.getUint8(7)) +
                  padHex(value.getUint8(6)) +
                  padHex(value.getUint8(5))
              );
            });
            break;

          case BluetoothUUID.getCharacteristic(
            "ieee_11073-20601_regulatory_certification_data_list"
          ):
            await characteristic.readValue().then((value) => {
              log(
                "c> IEEE 11073-20601 Regulatory Certification Data List: " +
                  decoder.decode(value)
              );
            });
            break;

          case BluetoothUUID.getCharacteristic("pnp_id"):
            await characteristic.readValue().then((value) => {
              log("c> PnP ID:");
              log(
                "  > Vendor ID Source: " +
                  (value.getUint8(0) === 1 ? "Bluetooth" : "USB")
              );
              if (value.getUint8(0) === 1) {
                log(
                  "  > Vendor ID: " +
                    (value.getUint8(1) | (value.getUint8(2) << 8))
                );
              } else {
                log(
                  "  > Vendor ID: " +
                    getUsbVendorName(
                      value.getUint8(1) | (value.getUint8(2) << 8)
                    )
                );
              }
              log(
                "  > Product ID: " +
                  (value.getUint8(3) | (value.getUint8(4) << 8))
              );
              log(
                "  > Product Version: " +
                  (value.getUint8(5) | (value.getUint8(6) << 8))
              );
            });
            break;

          case BluetoothUUID.getCharacteristic("battery_level"):
            log("c> battery_level");

            break;

          case BluetoothUUID.getCharacteristic("date_time"):
            interesting = true;
            log("c> date_time");

            break;

          case BluetoothUUID.getCharacteristic("weight"):
            interesting = true;
            log("c> weight");

            break;
          case BluetoothUUID.getCharacteristic("weight_measurement"):
            interesting = true;
            log("c> weight_measurement");

            break;
          case BluetoothUUID.getCharacteristic("weight_scale_feature"):
            interesting = true;
            log("c> weight_scale_feature", characteristic);
            break;

          case BluetoothUUID.getCharacteristic("heart_rate_measurement"):
            interesting = true;
            log("c> heart_rate_measurement", characteristic);
            window.char = characteristic;
            this.heart = characteristic;

            break;

          default:
            interesting = true;
            log("c> Unknown Characteristic: " + characteristic.uuid);
            break;
        }

        if (characteristic.properties) {
          log(
            ">> props:",
            characteristic.uuid,
            props(characteristic.properties)
          );
        }
        if (interesting) {
          const des = await characteristic
            .getDescriptors()
            .catch((err) => err.message);
          log(">> des:", des);
          if (Array.isArray(des)) {
            for (const de of des) {
              const val = await de.readValue().catch((e) => e.message);
              log(">>> desvalue:", de.uuid, valueArray(val));
            }
          }
        }
        if (interesting && characteristic.properties.indicate) {
          log(">> startNotifications");
          characteristic.startNotifications().then((_) => {
            log("))))) Notifications started", characteristic);
            characteristic.addEventListener(
              "characteristicvaluechanged",
              handleNotifications
            );
          });
        }

        if (interesting && characteristic.properties.read)
          await characteristic
            .readValue()
            .then((value) => {
              log(">> read uint", valueArray(value));
            })
            .catch((e) => {
              log(">> err", e.message);
            });
      }
    } catch (error) {
      log("Argh! " + error);
    }
    return;

    navigator.bluetooth
      .requestDevice({ filters: [{ services: ["battery_service"] }] })
      .then((device) => device.gatt.connect())
      .then((server) => {
        // Getting Battery Service…
        return server.getPrimaryService("battery_service");
      })
      .then((service) => {
        // Getting Battery Level Characteristic…
        return service.getCharacteristic("battery_level");
      })
      .then((characteristic) => {
        // Reading Battery Level…
        return characteristic.readValue();
      })
      .then((value) => {
        console.log(`Battery percentage is ${value.getUint8(0)}`);
      })
      .catch((error) => {
        console.error(error);
      });
  }