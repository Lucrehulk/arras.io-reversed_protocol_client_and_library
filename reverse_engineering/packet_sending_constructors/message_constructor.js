function construct_message_packet(message) {
    let packet;
    let encoded_message = new TextEncoder().encode(message);
    if (message.length < 32) {
    packet = new Uint8Array(message.length + 2);
    packet[1] = message.length + 192;
    packet.set(encoded_message, 2);
    } else {
    packet = new Uint8Array(message.length + 4);
    packet[1] = 254;
    packet[2] = message.length;
    packet[3] = 0;
    packet.set(encoded_message, 4);
    }
    packet[0] = 77;
    return packet;
}