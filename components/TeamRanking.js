import React, { useState } from 'react';
import { View, Text, Picker, ScrollView } from 'react-native';

function normalizePlayerName(name) {
  return (name || '').replace(/\s+/g, ' ').trim().toUpperCase();
}

const forwardsPositions = ["PROP 1", "HOOKER", "PROP 3", "SECOND ROW", "FLANKER", "NUMBER 8"];
const backsPositions = ["SCRUM HALF", "FLY HALF", "CENTRE", "WING", "FULLBACK"];

export default function TeamRanking({ rawData }) {
  const [sessionType, setSessionType] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  // Agrupar por nombre normalizado pero mostrar el original más frecuente
  const nameMap = {};
  rawData.forEach(row => {
    const original = row["Player Name"] || row["player name"] || row["Jugador"];
    const norm = normalizePlayerName(original);
    if (!nameMap[norm]) nameMap[norm] = {};
    nameMap[norm][original] = (nameMap[norm][original] || 0) + 1;
  });
  const players = Object.keys(nameMap).map(norm => {
    const originals = Object.entries(nameMap[norm]);
    originals.sort((a, b) => b[1] - a[1]);
    return originals[0][0];
  });

  let ranking = [];
  players.forEach(player => {
    const norm = normalizePlayerName(player);
    const playerRows = rawData.filter(row => {
      const playerNorm = normalizePlayerName(row["Player Name"] || row["player name"] || row["Jugador"]);
      if (playerNorm !== norm) return false;
      if (!row["Top Speed"] || isNaN(parseFloat(row["Top Speed"]))) return false;
      if (sessionType && (row["Session Type"] || "") !== sessionType) return false;
      if (positionFilter) {
        const pos = (row["Player Position"] || row[Object.keys(row)[8]] || "").toUpperCase();
        if (positionFilter === "Forwards" && !forwardsPositions.includes(pos)) return false;
        if (positionFilter === "Backs" && !backsPositions.includes(pos)) return false;
        if (positionFilter !== "Forwards" && positionFilter !== "Backs" && pos !== positionFilter.toUpperCase()) return false;
      }
      return true;
    });
    if (playerRows.length === 0) return;
    // Buscar el registro con el máximo Top Speed
    let maxRow = playerRows.reduce((max, row) => parseFloat(row["Top Speed"]) > parseFloat(max["Top Speed"]) ? row : max, playerRows[0]);
    ranking.push({
      player: player,
      topSpeed: maxRow["Top Speed"],
      date: (maxRow["Date"] || maxRow["Fecha"] || "").split(" ")[0],
      sessionType: maxRow["Session Type"] || "",
      position: maxRow["Player Position"] || maxRow[Object.keys(maxRow)[8]] || ""
    });
  });
  ranking = ranking.filter(r => r.topSpeed).sort((a, b) => parseFloat(b.topSpeed) - parseFloat(a.topSpeed));

  return (
    <View style={{ marginTop: 24, marginBottom: 24, backgroundColor: '#23283A', borderRadius: 14, padding: 18 }}>
      <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Ranking histórico de Top Speed</Text>
      {/* Selectores de sesión y posición */}
      <Text style={{ color: '#FFD700', marginTop: 12 }}>Tipo de sesión:</Text>
      <Picker selectedValue={sessionType} onValueChange={setSessionType} style={{ color: '#fff', backgroundColor: '#23283A' }}>
        <Picker.Item label="Todos" value="" />
        <Picker.Item label="Match Day" value="Match Day" />
        <Picker.Item label="Training" value="Training" />
      </Picker>
      <Text style={{ color: '#FFD700', marginTop: 12 }}>Posición:</Text>
      <Picker selectedValue={positionFilter} onValueChange={setPositionFilter} style={{ color: '#fff', backgroundColor: '#23283A' }}>
        <Picker.Item label="Todos" value="" />
        <Picker.Item label="Forwards" value="Forwards" />
        <Picker.Item label="Backs" value="Backs" />
      </Picker>
      <View style={{ marginTop: 16, borderRadius: 8, overflow: 'hidden', backgroundColor: '#222733', borderWidth: 1, borderColor: '#FFD700' }}>
        {/* Encabezados de la tabla */}
        <View style={{ flexDirection: 'row', backgroundColor: '#FFD700', paddingVertical: 8 }}>
          <Text style={{ flex: 1, fontWeight: 'bold', color: '#23283A', textAlign: 'center' }}>Ranking</Text>
          <Text style={{ flex: 2, fontWeight: 'bold', color: '#23283A', textAlign: 'center' }}>Player</Text>
          <Text style={{ flex: 2, fontWeight: 'bold', color: '#23283A', textAlign: 'center' }}>Position</Text>
          <Text style={{ flex: 2, fontWeight: 'bold', color: '#23283A', textAlign: 'center' }}>Top Speed</Text>
          <Text style={{ flex: 2, fontWeight: 'bold', color: '#23283A', textAlign: 'center' }}>Date</Text>
          <Text style={{ flex: 2, fontWeight: 'bold', color: '#23283A', textAlign: 'center' }}>Session Type</Text>
        </View>
        {/* Filas de la tabla */}
        <ScrollView horizontal style={{ minHeight: 350 }}>
          <View>
            {ranking.slice(0, 10).map((row, idx) => {
              let emoji = "";
              if (idx === 0) emoji = "🥇";
              else if (idx === 1) emoji = "🥈";
              else if (idx === 2) emoji = "🥉";
              else if (idx === 3) emoji = "🥄";
              else emoji = "😭";
              return (
                <View key={row.player + row.date} style={{ flexDirection: 'row', backgroundColor: idx % 2 === 0 ? '#23283A' : '#181C24', paddingVertical: 8 }}>
                  <Text style={{ flex: 1, color: '#FFD700', textAlign: 'center' }}>{emoji} {idx + 1}</Text>
                  <Text style={{ flex: 2, color: '#fff', textAlign: 'center' }}>{row.player}</Text>
                  <Text style={{ flex: 2, color: '#fff', textAlign: 'center' }}>{row.position}</Text>
                  <Text style={{ flex: 2, color: '#fff', textAlign: 'center' }}>{row.topSpeed}</Text>
                  <Text style={{ flex: 2, color: '#fff', textAlign: 'center' }}>{row.date}</Text>
                  <Text style={{ flex: 2, color: '#fff', textAlign: 'center' }}>{row.sessionType}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
