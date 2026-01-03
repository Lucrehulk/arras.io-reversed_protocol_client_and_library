class mockup_parser {
    constructor() {
        this.mockups = {};
        this.mockups_name_id_map = {};
        this.decoder = new TextDecoder();
    }

    parse(packet) {
        // For now I just made the mockups get the names and shapes
        let offset = 2;
        while (offset < packet.length) {
            if (packet[offset + 1] !== 0 && packet[offset] > 0 && packet[offset] == Math.trunc(packet[offset]) && packet[offset + 1] == Math.trunc(packet[offset + 1])) {
                let id = packet[offset];
                let name_len = packet[offset + 1];
                if (name_len < 0) name_len = 32 + name_len;
                let potential_name_bytes = packet.slice(offset + 2, offset + 2 + name_len);
                if (!potential_name_bytes.some(byte => byte > 255)) {
                    let potential_name = this.decoder.decode(new Uint8Array(potential_name_bytes));
                    let cleaned_name = potential_name.split("/")[0].trim();
                    if (!/[\p{C}\uFFFD]/u.test(cleaned_name) && cleaned_name.length > 0) {
                        let shape = packet[offset + 4 + name_len];
                        if (shape == 2048) {
                            shape = 0;
                        } else {
                            if (shape > 1024) shape -= 1024;
                        };
                        this.mockups[id] = {
                            name: cleaned_name, 
                            shape: shape
                        };
                        this.mockups_name_id_map[cleaned_name] = id;
                    }
                }
            }
            offset++;
        }
    }
}
