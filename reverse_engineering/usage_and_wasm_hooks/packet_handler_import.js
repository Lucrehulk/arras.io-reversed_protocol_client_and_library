(value, xor, type, address) => {
    if (!type) {
        if (window.new_packet_message) {
        switch (window.message_packet[0]) {
            case 117:
                window.encoded_packet = new Uint8Array(window.message_packet);
                window.decoded_packet = decode_packet(window.encoded_packet, "u");
                update_data.parse(window.decoded_packet[0], window.decoded_packet[1], window.encoded_packet);
            break;
            case 98:
                window.encoded_packet = new Uint8Array(window.message_packet);
                window.decoded_packet = decode_packet(window.encoded_packet, "b");
                broadcast_data.parse(window.decoded_packet[0], window.decoded_packet[1], window.encoded_packet);
            break;
            case 82:
                let game_data_length = window.message_packet[2] + window.message_packet[3] * 256;
                let game_data_end = 4 + game_data_length;
                let game_data = new TextDecoder().decode(new Uint8Array(window.message_packet.slice(4, game_data_end)));
                let remaining_packet = decode_packet(new Uint8Array(window.message_packet.slice(game_data_end, window.message_packet.length)))[0];
                room_data.parse(remaining_packet, game_data);
            break;
            case 74:
                window.decoded_packet = decode_packet(new Uint8Array(window.message_packet), "J")[0];
                mockup_data.parse(window.decoded_packet);
            break;
            case 80:
                window.encoded_packet = new Uint8Array(window.message_packet);
                window.decoded_packet = decode_packet(window.encoded_packet, "P");
                player_tab_data.parse(window.decoded_packet[0], window.decoded_packet[1], window.encoded_packet);
            break;
            default:
                window.message_packet[0] = String.fromCharCode(window.message_packet[0]);
        }
        window.message_packet = [];
        window.message_packet_address = address;
        window.new_packet_message = false;
        }
        let decoded_value = (value ^ xor) & 255;
        window.message_packet.push(decoded_value);
    } else {
    if (window.new_packet_send) {
        window.send_packet[0] = String.fromCharCode(window.send_packet[0]);
        // if (send_packet[0] !== "p" && send_packet[0] !== "C") console.log("sending packet: ", window.send_packet);
        window.send_packet = [];
        window.new_packet_send = false;
    }
    window.send_packet.push(value);
    }
}