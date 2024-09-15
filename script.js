// map基本設定
const map = L.map('map').setView([35.689501375244, 139.69173371705], 10);  // 都庁を中心に設定
map.locate({ setView: true, maxZoom: 13 });

// アイコン設定
const icons = {
    child: L.icon({
        className: 'custom-icon',
        iconUrl: "img/Pin.svg",
        shadowUrl: "img/shadow.png",
        iconSize: [50, 50],  // これはアイコンの大きさに応じて調整する必要があるかもしれません
        iconAnchor: [25, 50],  // こちらもアイコンの大きさに応じて中心点を調整
        popupAnchor: [0, -10]
    }),

};

// タイルレイヤーの作成
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
});

const osmjp = L.tileLayer('https://{s}.tile.openstreetmap.jp/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
});

const gsimaps = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.gsi.go.jp/">国土地理院</a>',
    maxZoom: 19
})


// 地図にデフォルトのレイヤーを追加（ここではosm）
osm.addTo(map);

// レイヤー切り替えコントロール
const baseMaps = {
    "OpenStreetMap": osm,
    "OpenStreetMap Japan": osmjp,
    "地理院地図": gsimaps,

};

// レイヤーコントロールの追加
L.control.layers(baseMaps).addTo(map);

// データをcsvから読む
let data;
const csvFileName = "kodomo-shokudo.csv"
Papa.parse(csvFileName, {
    download: true,
    dynamicTyping: true,

    header: true,
    complete: function (results) {
        data = results.data;
        filterData();

    }
});

function filterData() {
    // マーカーを一旦削除
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const markers = L.markerClusterGroup( {disableClusteringAtZoom: 14} );

    data.forEach((entry) => {
        // 以下の要素がない行はスキップ
        if (!entry["経度"] || !entry["緯度"]) return;


        let icon;
        icon = icons.child;
        const marker = L.marker([entry["緯度"], entry["経度"]], { icon: icon });

        marker.on('click', function () {
            const sidebarContent = document.getElementById('sidebar-content');
            sidebarContent.innerHTML =
                `
                    <div class="info">
                    <h4>${entry["名称"]}（${entry["名称_カナ"]}）</h4>
                    <div>${entry["画像"] ? "<img  class='info-photo' src='" + entry["画像"] + "'>" : ""}</div>
                    <p>住所：${entry["住所"] ? entry["住所"] : "記載なし"}　${entry["方書"] ? entry["方書"] : ""}</p>
                    <p>URL：${entry["URL"] ? "<a href='" + entry["URL"] + "'>" + entry["URL"] + "</a>" : "記載なし"}</p>
                    <p>運営団体名：${entry["運営団体名"] ? entry["運営団体名"] : "記載なし"}</p>
                    <hr>

                    <p>開催頻度：${getFrequency(entry["開催頻度"])}</p>
                    <p>開催曜日：${entry["開催曜日"] ? entry["開催曜日"] : "記載なし"}</p>
                    <p>開催時間：${entry["開催開始時間"] ? entry["開催開始時間"] : ""}〜${entry["開催終了時間"] ? entry["開催終了時間"] : ""}</p>
                    <p>開催日時特記事項：${entry["開催日時特記事項"] ? "(" + entry["開催日時特記事項"] + ")" : "記載なし"}</p>
                    <hr>

                    <p>実施支援の主な区分：${entry["実施支援の主な区分"] ? entry["実施支援の主な区分"] : "記載なし"}</p>
                    <p>予約方法：${entry["予約方法"] ? entry["予約方法"] : "記載なし"}</p>
                    <p>予約特記事項：${entry["予約特記事項"] ? entry["予約特記事項"] : "記載なし"}</p>
                    <p>定員：${entry["定員"] ? entry["定員"] : "記載なし"}</p>
                    <p>学区：${entry["学区"] ? entry["学区"] : "記載なし"}</p>
                    <p>ネットワークの加入：${entry["ネットワークの加入"] ? entry["ネットワークの加入"] : "記載なし"}</p>
                    <p>参加条件：${entry["参加条件"] ? entry["参加条件"] : "記載なし"}</p>
                    ${entry["フードパントリー実施"] == "1" ? "<span class=\"tag\">フードパントリー実施</span>" : ""}  
                    ${entry["テイクアウト実施"] == "1" ? "<span class=\"tag\">テイクアウト実施</span>" : ""}  
                    <hr>

                    <h4>参加費</h4> 
                        <table>
                            <tr>
                                <th>幼児</th><th>小学生</th><th>中学生</th><th>高校生</th><th>大人</th>
                            </tr>
                            <tr>
                                <td>${entry["参加費_幼児"] ? entry["参加費_幼児"] + "円" : "--"}</td>
                                <td>${entry["参加費_小学生"] ? entry["参加費_小学生"] + "円" : "--"}</td>
                                <td>${entry["参加費_中学生"] ? entry["参加費_中学生"] + "円" : "--"}</td>
                                <td>${entry["参加費_高校生"] ? entry["参加費_高校生"] + "円" : "--"}</td>
                                <td>${entry["参加費_大人"] ? entry["参加費_大人"] + "円" : "--"}</td>
                            </tr>
                        </table>
                    <small>${entry["参加費特記事項"] ? "※" + entry["参加費特記事項"] : ""}</small>
                    </div>`;
        });
        markers.addLayer(marker);

    });
    map.addLayer(markers);
}

// 開催頻度をパラメータとして、文字列を返す関数
function getFrequency(frequency) {
    switch (parseInt(frequency)) {
        case 1:
            return "ほぼ毎日(週5〜7回程度)";
        case 2:
            return "週3〜4回程度";
        case 3:
            return "週1〜2回程度";
        case 4:
            return "2週間に1回程度";
        case 5:
            return "月1回程度";
        case 6:
            return "数か月に1回程度";
        case 7:
            return "季節限定(長期休暇中のみなど)";
        case 8:
            return "不定期";
        default:
            return "記載なし";
    }
}
