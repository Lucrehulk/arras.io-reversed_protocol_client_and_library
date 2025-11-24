class broadcast_parser {
    constructor() {
        this.global_minimap = {};
        this.team_minimap = {};
        this.leaderboard = {};
        this.decoder = new TextDecoder();
    }

    parse(packet, offsets, encoded_packet) {
        let offset = 1;
        offset = this.parse_global_minimap_deletions(packet, offset, offsets, encoded_packet);
        offset = this.parse_global_minimap(packet, offset, offsets, encoded_packet);
        offset = this.parse_team_minimap_deletions(packet, offset, offsets, encoded_packet);
        offset = this.parse_team_minimap(packet, offset, offsets, encoded_packet);
        offset = this.parse_leaderboard_deletions(packet, offset, offsets, encoded_packet);
        offset = this.parse_leaderboard(packet, offset, offsets, encoded_packet);
    }

    parse_global_minimap(packet, offset) {
        let len = packet[offset++];
        for (let iter = 0; iter < len; iter++) {
            let id = packet[offset++];
            let type = packet[offset++];
            this.global_minimap[id] = {
                type: type,
                x: packet[offset++],
                y: packet[offset++],
                color: packet[offset++],
                size: packet[offset++],
            }
        }
        return offset;
    }

    parse_global_minimap_deletions(packet, offset) {
        let len = packet[offset++];
        for (let iter = 0; iter < len; iter++) {
            delete this.global_minimap[packet[offset++]];
        }
        return offset;
    }

    parse_team_minimap(packet, offset) {
        let len = packet[offset++];
        for (let iter = 0; iter < len; iter++) {
            this.team_minimap[packet[offset++]] = {
                x: packet[offset++],
                y: packet[offset++],
                color: packet[offset++],
            }
        }
        return offset;
    }

    parse_team_minimap_deletions(packet, offset) {
        let len = packet[offset++];
        for (let iter = 0; iter < len; iter++) {
            delete this.team_minimap[packet[offset++]];
        }
        return offset;
    }

    parse_leaderboard(packet, offset, offsets, encoded_packet) {
        let len = packet[offset++];
        for (let iter = 0; iter < len; iter++) {
            let id = packet[offset++];
            let entry = {
                score: packet[offset++],
                mockup_index: packet[offset++]
            };
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
            entry.name = name;
            entry.color = packet[offset++];
            entry.bar_color = packet[offset++];
            this.leaderboard[id] = entry;
        }
        return offset;
    }

    parse_leaderboard_deletions(packet, offset) {
        let len = packet[offset++];
        for (let iter = 0; iter < len; iter++) {
            delete this.leaderboard[packet[offset++]];
        }
        return offset;
    }
}