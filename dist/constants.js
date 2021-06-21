"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT_SHARD_LIST = exports.BOT_TOTAL_SHARDS = exports.DISCORD_ID = exports.DISCORD_TOKEN = void 0;
exports.DISCORD_TOKEN = process.env['DISCORD_TOKEN'] || '';
exports.DISCORD_ID = atob(exports.DISCORD_TOKEN.replace(/\..+/, ''));
exports.BOT_TOTAL_SHARDS = Number(process.env['BOT_TOTAL_SHARDS']) || 'auto';
exports.BOT_SHARD_LIST = process.env['BOT_SHARD_LIST']?.split(',').map(Number) ?? 'auto';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBYSxRQUFBLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuRCxRQUFBLFVBQVUsR0FBRyxJQUFJLENBQUMscUJBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFckQsUUFBQSxnQkFBZ0IsR0FDekIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztBQUN6QyxRQUFBLGNBQWMsR0FDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDIn0=