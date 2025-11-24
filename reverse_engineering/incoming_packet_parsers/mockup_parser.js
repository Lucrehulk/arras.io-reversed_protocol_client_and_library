class mockup_parser {
    constructor() {
        this.mockups = {};
        this.decoder = new TextDecoder();
    }

    parse(packet) {
        // For now I just made the mockups get the names, almost no point to getting the other data.
        let offset = 2;
        while (offset < packet.length) {
            if (packet[offset + 1] !== 0 && packet[offset] > 0 && packet[offset] == Math.trunc(packet[offset]) && packet[offset + 1] == Math.trunc(packet[offset + 1])) {
                let id = packet[offset];
                let name_len = packet[offset + 1];
                if (name_len < 0) name_len = 32 + name_len;
                let potential_name_bytes = packet.slice(offset + 2, offset + 2 + name_len);
                if (!potential_name_bytes.some(byte => byte > 255)) {
                    let potential_name = this.decoder.decode(new Uint8Array(potential_name_bytes));
                    if (/[\p{C}\uFFFD]/u.test(potential_name) == false) this.mockups[id] = potential_name;
                }
            }
            offset++;
        }
    }
}