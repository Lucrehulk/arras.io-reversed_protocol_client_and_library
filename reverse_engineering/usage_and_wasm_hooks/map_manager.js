class map_manager {
    constructor() {
        this.map = [[]];
        this.node_half_width = 0;
        this.node_half_height = 0;
        this.map_width = 0;
        this.map_height = 0;
        this.encoding_shift = 0;
        this.pathfinding_dirs = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1]
        ];
    }

    parse_maze_map(room, global_minimap) {
        let sizes = {};
        for (let id in global_minimap) if (global_minimap[id].type == 2) if (!sizes[global_minimap[id].size]) sizes[global_minimap[id].size] = true;
        let sizes_values = Object.keys(sizes);
        let first_size = sizes_values[0];
        for (let iter = 1; iter < sizes_values.length; iter++) if (sizes_values[iter] < first_size) sizes_values[iter] = first_size;
        this.map_width = Math.trunc(room.room_dimensions[2] / first_size);
        this.map_height = Math.trunc(room.room_dimensions[3] / first_size);
        this.encoding_shift = Math.ceil(Math.log2(this.map_height));
        this.node_half_width = room.room_dimensions[2] / this.map_width;
        this.node_half_height = room.room_dimensions[3] / this.map_height;
        this.map = Array.from({
            length: this.map_height
        }, () => Array.from({
            length: this.map_width
        }, () => 0));
        let dx = 255 / this.map_width;
        let dy = 255 / this.map_height;
        for (let id in global_minimap) {
            if (global_minimap[id].type == 2) {
                let size = Math.trunc(global_minimap[id].size / first_size);
                let x_pos = Math.round((global_minimap[id].x - dx * (size / 2)) / dx);
                let y_pos = Math.round((global_minimap[id].y - dy * (size / 2)) / dy);
                for (let y = 0; y < size; y++)
                    for (let x = 0; x < size; x++) this.map[y_pos + y][x_pos + x] = 1;
            }
        }
        let room_grid_node_size = this.map_height / room.grid.length;
        for (let y = 0; y < room.grid.length; y++) {
            for (let x = 0; x < room.grid[0].length; x++) {
                if (room.grid[y][x] == 10 || room.grid[y][x] == 11 || room.grid[y][x] == 12 || room.grid[y][x] == 15) {
                    for (let height = 0; height < room_grid_node_size; height++) {
                        for (let width = 0; width < room_grid_node_size; width++) {
                            this.map[Math.trunc(y * room_grid_node_size) + height][Math.trunc(x * room_grid_node_size) + width] = room.grid[y][x];
                        }
                    }
                }
            }
        }
    }

    update_map(room, global_minimap) {
        for (let id in global_minimap)
            if (global_minimap[id].type == 2) return this.parse_maze_map(room, global_minimap);
        this.map = room.grid;
        this.map_width = this.map[0].length;
        this.map_height = this.map.length;
        this.encoding_shift = Math.ceil(Math.log2(this.map_height));
        this.node_half_width = room_dimensions[2] / this.map_width;
        this.node_half_height = room_dimensions[3] / this.map_height;
    }

    parse_node_coordinate(x, y, room_dimensions) {
        let x_ratio = x / this.map_width;
        let y_ratio = y / this.map_height;
        return [(x_ratio * room_dimensions[2] * 2 - room_dimensions[2]) + this.node_half_width, (y_ratio * room_dimensions[3] * 2 - room_dimensions[3]) + this.node_half_height];
    }

    parse_map_coordinate(x, y) {
        let x_ratio = x / 255;
        let y_ratio = y / 255;
        return [Math.trunc(x_ratio * this.map_width), Math.trunc(y_ratio * this.map_height)];
    }

    parse_position_coordinate(x, y, room_dimensions) {
        let width = room_dimensions[2] * 2;
        let height = room_dimensions[3] * 2;
        let x_ratio = (x + room_dimensions[2]) / width;
        let y_ratio = (y + room_dimensions[3]) / height;
        return [Math.trunc(x_ratio * this.map_width), Math.trunc(y_ratio * this.map_height)];
    }

    find_path(i, f, color) {
        let path_queue = [[i[0], i[1], [[i[0], i[1]]]]];
        let nodes = new Set();
        nodes.add((i[0] << this.encoding_shift) | i[1]);
        while (path_queue.length > 0) {
            let [x, y, path] = path_queue.shift();
            if (x == f[0] && y == f[1]) return path;
            for (let dir in this.pathfinding_dirs) {
                let nx = x + this.pathfinding_dirs[dir][0];
                let ny = y + this.pathfinding_dirs[dir][1];
                if (nx > -1 && nx < this.map_width && ny > -1 && ny < this.map_height) {
                    if (this.map[ny][nx] == 0 || this.map[ny][nx] == color) {
                        if (!nodes.has((nx << this.encoding_shift) | ny)) {
                            nodes.add((nx << this.encoding_shift) | ny);
                            path_queue.push([nx, ny, path.concat([[nx, ny]])]);
                        }
                    }
                }
            }
        }
        return false;
    }
}
