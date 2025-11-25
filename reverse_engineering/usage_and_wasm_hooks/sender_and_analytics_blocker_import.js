(index, slice) => {
    if (u8[index] == 84) {
        window.analytics_data = JSON.parse(new TextDecoder().decode(u8.slice(index + 4, index + slice)));
        window.user_id = analytics_data.storage.id;
        let new_message = "This blocks analytics packet data.";
        if (new_message.length > slice - 4) {
            new_message = new_message.slice(0, slice - 4);
        } else {
            while (new_message.length < slice - 4) new_message += "/";
        }
        new_message = new TextEncoder().encode(new_message);
        u8.set(new_message, index + 4);
    };
    let new_packet = window.packet_queue.pop();
    if (new_packet) {
        u8.set(new_packet, 0);
        return new_packet.byteLength; 
    };
    return 0;
}
