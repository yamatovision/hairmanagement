import { injectable } from 'tsyringe';

/**
 * 出生地の位置情報を取得するサービス
 * 出生地から経度・緯度情報を提供する
 */
@injectable()
export class BirthLocationService {
  // 主要都市の経度・緯度マップ
  private readonly cityMap: Record<string, { longitude: number, latitude: number }> = {
    '東京': { longitude: 139.6917, latitude: 35.6895 },
    '大阪': { longitude: 135.5023, latitude: 34.6937 },
    '名古屋': { longitude: 136.9066, latitude: 35.1815 },
    '札幌': { longitude: 141.3544, latitude: 43.0621 },
    '福岡': { longitude: 130.4017, latitude: 33.5902 },
    '横浜': { longitude: 139.6380, latitude: 35.4437 },
    '神戸': { longitude: 135.1943, latitude: 34.6901 },
    '京都': { longitude: 135.7680, latitude: 35.0116 },
    '広島': { longitude: 132.4553, latitude: 34.3853 },
    '仙台': { longitude: 140.8694, latitude: 38.2682 },
    '北京': { longitude: 116.4074, latitude: 39.9042 },
    '上海': { longitude: 121.4737, latitude: 31.2304 },
    'ソウル': { longitude: 126.9780, latitude: 37.5665 },
    'ニューヨーク': { longitude: -74.0060, latitude: 40.7128 },
    'ロンドン': { longitude: -0.1278, latitude: 51.5074 },
    'パリ': { longitude: 2.3522, latitude: 48.8566 },
    'シドニー': { longitude: 151.2093, latitude: -33.8688 }
  };

  /**
   * 都市名から経度・緯度情報を取得
   * @param locationStr 都市名
   * @returns 経度・緯度情報、または null
   */
  async getCoordinates(locationStr: string): Promise<{ longitude: number, latitude: number } | null> {
    // 都市名で経度・緯度を探す
    for (const city in this.cityMap) {
      if (locationStr?.includes(city)) {
        return this.cityMap[city];
      }
    }
    
    // 見つからない場合は東京の座標を返す
    return this.cityMap['東京'];
  }
  
  /**
   * 出生地から経度・緯度情報を取得する
   * @param location 出生地（文字列または座標オブジェクト）
   * @returns 経度・緯度情報
   */
  async getLocationCoordinates(location: string | { longitude: number, latitude: number }): Promise<{ longitude: number, latitude: number }> {
    if (!location) {
      // 出生地が未指定の場合はデフォルト（東京）の座標を返す
      return this.cityMap['東京'];
    }
    
    if (typeof location === 'string') {
      // 文字列の場合、都市名から座標を取得
      const coordinates = await this.getCoordinates(location);
      return coordinates || this.cityMap['東京'];
    } else {
      // すでに座標オブジェクトの場合はそのまま返す
      return location;
    }
  }
  
  /**
   * 経度から地方時と標準時の差を計算
   * @param longitude 経度
   * @returns 時差（時間単位）
   */
  calculateLocalTimeOffset(longitude: number): number {
    // 日本の標準経線は 135 度
    const standardMeridian = 135;
    const offset = (longitude - standardMeridian) * 4; // 経度1度=4分
    return offset / 60; // 時間単位に変換
  }
}