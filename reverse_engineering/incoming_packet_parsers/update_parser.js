class update_parser {
    constructor() {
        this.player = {};
        this.entities = {};
        this.deleted_entities = [];
        this.tick = 0;
        this.decoder = new TextDecoder();
        this.static_mockups = [];
    }

    parse(packet, offsets, encoded_packet) {
        this.deleted_entities = [];
        this.player.x = packet[1];
        this.player.y = packet[2];
        if (this.player.entity_data) {
            this.player.entity_data.x = this.player.x;
            this.player.entity_data.y = this.player.y;
        }
        this.player.fov = packet[3];
        if (packet.length > 5) {
            let flags = packet[4];
            let offset = 5;
            if (flags & (1 << 0)) {
                this.player.mspt = packet[offset++];
            }
            if (flags & (1 << 1)) {
                this.player.speed = packet[offset++];
            }
            if (flags & (1 << 2)) {
                this.player.mockup_id = packet[offset++];
                // Mockup value repeats for some reason, so I'm just skipping the extra one.
                offset++;
            }
            if (flags & (1 << 3)) {
                this.player.color = packet[offset++];
                this.player.id = packet[offset++];
            }
            if (flags & (1 << 4)) {
                this.player.score = packet[offset++];
            }
            if (flags & (1 << 5)) {
                this.player.kill_stats = {
                    player: packet[offset++],
                    assist: packet[offset++],
                    boss: packet[offset++],
                    polygon: packet[offset]
                }
            }
            if (flags & (1 << 6)) {
                this.player.stat_points = packet[offset++];
            }
            if (flags & (1 << 7)) {
                this.player.stat_points = packet[offset++];
                if (!this.player.stats) {
                    this.player.stats = [];
                    for (let stat = 0; stat < 10; stat++) this.player.stats[stat] = {
                        max: packet[offset++]
                    };
                } else {
                    for (let stat = 0; stat < 10; stat++) this.player.stats[stat].max = packet[offset++];
                }
            }
            if (flags & (1 << 8)) {
                for (let stat = 0; stat < 10; stat++) this.player.stats[stat].value = packet[offset++];
            }
            if (flags & (1 << 9)) {
                let upgrades_len = packet[offset++];
                this.player.upgrades = [];
                for (let upgrade = 0; upgrade < upgrades_len; upgrade++) this.player.upgrades.push(packet[offset++]);
            }
            offset = packet.indexOf(-1, 4) + 1;
            while (packet[offset] !== -1) {
                let id = packet[offset++];
                if (this.entities[id]) this.delete_entity(id, this.entities[id].mockup_id);
            };
            offset++;
            while (offset < packet.length - 1) {
                let id = packet[offset++];
                let result = this.parse_entity(packet, offset, id, offsets, encoded_packet);
                if (id == this.player.id) {
                    result[0].x = this.player.x;
                    result[0].y = this.player.y;
                    this.player.entity_data = result[0];
                }
                this.entities[id] = result[0];
                offset = result[1];
            }
        }
        this.determine_entity_deletions();
        this.tick++;
    }

    delete_entity(id, mockup_id) {
        if (!this.static_mockups[mockup_id]) {
            this.deleted_entities.push(id);
            delete this.entities[id];
        }
    }

    determine_entity_deletions() {
        for (let id in this.entities) {
            let entity = this.entities[id];
            let dx_check = Math.abs(entity.x - this.player.x) > this.player.fov + 60 + entity.size * 2;
            let dy_check = Math.abs(entity.y - this.player.y) > this.player.fov * 0.5 + 60 + entity.size * 2;
            if (this.tick - entity.last_updated > 5 && (
            dx_check ||
            dy_check ||
            entity.health !== 1 ||
            ((entity.flags_data.auto_spin || entity.color == 5) && entity.layer > 7) ||
            entity.flags == 0 || 
            ((entity.flags_data.damage_indicator_first_degree || 
            entity.flags_data.damage_indicator_second_degree) && !entity.flags_data.idk_flag)
            )) {
                this.delete_entity(id, entity.mockup_id);
            };
        }; 
    }

    parse_entity(packet, offset, id, offsets, encoded_packet) {
        let entity;

        if (!this.entities[id]) {
            entity = {flags_data: {}};
        } else {
            entity = this.entities[id];
        }

        let flags = packet[offset++];

        if (flags & (1 << 0)) {
            let dx = packet[offset++] / 4;
            let dy = packet[offset++] / 4;
            if (!entity.x || !entity.y) {
                entity.x = dx;
                entity.y = dy;
            } else {
                entity.x += dx;
                entity.y += dy;
                entity.dx = dx;
                entity.dy = dy;
            }
        }
        if (flags & (1 << 1)) {
            let dv = packet[offset++] * Math.PI / 512;
            entity.angle = entity.angle ? entity.angle + dv : dv;
        }
        if (flags & (1 << 2)) {
            entity.mockup_id = packet[offset++];
        }
        if (flags & (1 << 3)) {
            entity.guns = entity.guns || {};
            while (packet[offset] !== -1) {
                let gun_index = packet[offset++];
                let gun_flags = packet[offset++];
                let time, power;
                if (gun_flags & (1 << 0)) {
                    time = packet[offset++];
                }
                if (gun_flags & (1 << 1)) {
                    power = packet[offset++];
                }
                entity.guns[gun_index] = {
                    flags: gun_flags,
                    time: time,
                    power: power
                }
            }
            offset++;
        }
        if (flags & (1 << 4)) {
            entity.turrets = entity.turrets || {};
            while (packet[offset] !== -1) {
                let turret_index = packet[offset++];
                let turret = this.parse_entity(packet, offset, undefined, offsets, encoded_packet);
                offset = turret[1];
                entity.turrets[turret_index] = turret[0];
            }
            offset++;
        }
        if (flags & (1 << 5)) {
            entity.flags = packet[offset++];
            if (entity.flags & (1 << 0)) entity.flags_data.auto_spin = true;
            if (entity.flags & (1 << 1)) entity.flags_data.reverse_tank = true;
            // Not certain exactly what this flag is
            if (entity.flags & (1 << 2)) entity.flags_data.idk_flag = true;
            if (entity.flags & (1 << 3)) entity.flags_data.invuln = true;
            // Note that both of these damage indicators can be turned on, which indicates max damage/penetration. Sort of like a "regular" hit and "critical" hit indicator, with second_degree being stronger than first, and both being on the max.
            if (entity.flags & (1 << 4)) entity.flags_data.damage_indicator_first_degree = true;
            if (entity.flags & (1 << 5)) entity.flags_data.damage_indicator_second_degree = true;
        }
        if (flags & (1 << 6)) {
            entity.health = packet[offset++] / 255;
        }
        if (flags & (1 << 7)) {
            entity.shield = packet[offset++] / 255;
        }
        if (flags & (1 << 8)) {
            entity.opacity = packet[offset++] / 255;
        }
        if (flags & (1 << 9)) {
            entity.size = Math.abs(packet[offset++]) * 0.0625;
        }
        if (flags & (1 << 10)) {
            entity.score = packet[offset++];
        }
        if (flags & (1 << 11)) {
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
            entity.name = name;
        }
        if (flags & (1 << 12)) {
            entity.color = packet[offset++];
        }
        if (flags & (1 << 13)) {
            entity.layer = packet[offset++];
        }
        entity.last_updated = this.tick;
        return [entity, offset];
    }
}
