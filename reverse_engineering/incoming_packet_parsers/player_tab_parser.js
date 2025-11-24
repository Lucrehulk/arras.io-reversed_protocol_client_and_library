class player_tab_parser {
    constructor() {
        this.players = {};
        this.decoder = new TextDecoder();
    }

    parse(packet, offsets, encoded_packet) {
        let deletions_len = packet[1];
        for (let deletion = 0; deletion < deletions_len; deletion += 1) delete this.players[packet[2 + deletion]];
        let offset = 2 + deletions_len;
        let additions_len = packet[offset++];
        for (let addition = 0; addition < additions_len; addition += 1) {
            let id = packet[offset++];
            let tier = packet[offset++];
            let name_len = encoded_packet[offsets[offset++]] - 192;
            let name_offset = offsets[offset];
            let bytes = 0;
            let name = "";
            while (bytes !== name_len) {
                let byte = encoded_packet[name_offset];
                let length;
                if (byte < 128) {
                    length = 1; 
                } else if (byte >= 192 && byte <= 223) {
                    length = 2; 
                } else if (byte >= 224 && byte <= 239) {
                    length = 3; 
                } else {
                    length = 4; 
                };
                name += this.decoder.decode(encoded_packet.slice(name_offset, name_offset + length));
                bytes += length;
                name_offset += length;
                offset += length == 1 ? 1 : 2;
            };
            this.players[id] = {
                tier: tier,
                name: name,
                mockup_index: packet[offset++]
            };
        }
    }
}