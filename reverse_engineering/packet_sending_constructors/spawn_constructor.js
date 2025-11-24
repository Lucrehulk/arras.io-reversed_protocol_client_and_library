function construct_spawn_packet(name, party) {
    let encoded_name = new TextEncoder().encode(name);
    let encoded_party = new TextEncoder().encode(party);
    let packet = new Uint8Array(encoded_name.byteLength + encoded_party.byteLength + 4);
    packet[1] = 192 + encoded_name.byteLength;
    packet.set(encoded_name, 2);
    packet[2 + encoded_name.length] = 192 + encoded_party.byteLength;
    packet.set(encoded_party, 3 + encoded_name.length);
    packet[packet.byteLength - 1] = 1;
    packet[0] = 115;
    return packet;
}