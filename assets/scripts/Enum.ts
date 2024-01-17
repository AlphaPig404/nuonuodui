import { AudioClip, Prefab, SpriteFrame } from "cc";

// 模式
export enum ENUM_GAME_MODE {
  SCORE = 'score',
  LEVEL = 'level'
}

// 状态
export enum ENUM_GAME_STATUS {
  UNRUNING = 'UNRUNING',
  RUNING = 'RUNING'
}

// 音效
export enum ENUM_AUDIO_CLIP {
  BGM = 'bgm',
  CLICK = 'click',
  TOUCH = 'touch',
  CLERE = 'clear',
  LOSE = 'lose',
  WIN = 'win',
  COLLECT = 'collect',
  MOVE = 'move',
  SHUFFLE = 'shuffle',
  BONUS = 'bonus'
}

// ui层
export enum ENUM_UI_TYPE {
  MENU = 'MenuLayer',
  MAIN = 'MainLayer',
  SETTING = 'SettingLayer',
  EXIT = 'ExitLayer',
  OVER = 'OverLayer',
  MORE = 'MoreLayer',
  RANK = 'RankLayer',
  EXIT_LEVEL = 'ExitLevelLayer',
  MAIN_LEVEL = 'MainLevelLayer',
  WIN = 'WinLayer',
  LOSE = 'LoseLayer'
}

// 事件
export enum ENUM_GAME_EVENT { }

// 资源
export const ENUM_RESOURCE_TYPE = ([
  { content: AudioClip, path: 'audio', type: 'audio', ratio: 0.4 },
  { content: Prefab, path: 'prefab', type: 'prefab', ratio: 0.3 },
  { content: SpriteFrame, path: 'sprite', type: 'sprite', ratio: 0.3 },
  // {content: cc.JsonAsset, path: 'json', type: 'json', ratio: 0.1},
])