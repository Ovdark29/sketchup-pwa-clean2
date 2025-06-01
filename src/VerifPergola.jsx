import React, { useState } from "react";

export default function VerifPergola() {
  const [type, setType] = useState("lames_simples");
  const [config, setConfig] = useState("1_poutre_1_verin");
  const [longueur, setLongueur] = useState(3000);
  const [avancee, setAvancee] = useState(3000);
  const [resultats, setResultats] = useState(null);

  const handleValider = async () => {
    setResultats(null);
    const jsonPath = `rules/${type}/${config}.json`;

    try {
      const res = await fetch(jsonPath);
      if (!res.ok) throw new Error("Fichier JSON non trouvé");
      const rules = await res.json();

      const l = parseInt(longueur);
      const a = parseInt(avancee);
      const surface = (l * a) / 1_000_000;

      const iLong = rules.longueurs.findIndex(val => val >= l);
      const iAv = rules.avancees.findIndex(val => val >= a);
      const nbLames = rules.lames_par_longueur[iLong] ?? "?";

      let couleur = "hors";
      if (iAv !== -1 && iLong !== -1 && rules.couleurs[iAv]?.[iLong]) {
        couleur = rules.couleurs[iAv][iLong];
      }

      let pente = "❌ Hors limites dimensionnelles";
      if (couleur === "vert") {
        pente = "✅ Pas de pente requise";
      } else if (couleur === "jaune") {
        pente = "⚠️ Pente de 5 mm/m requise";
      } else if (couleur === "orange") {
        pente = "⚠️ Pente de 8 mm/m requise";
      }

      let poteau = "✅ Aucun poteau requis";
      if (couleur === "hors" || iAv === -1 || iLong === -1) {
        poteau = "❌ Hors limites dimensionnelles";
        pente = "❌ Hors limites dimensionnelles";
      } else {
        const avRule = rules.poteau_si_avancee?.find(r =>
          a >= r.avancee_min && a <= r.avancee_max && l >= r.longueur_seuil
        );
        const lRule = rules.poteau_si_longueur?.find(r =>
          l >= r.longueur_min && l <= r.longueur_max && a >= r.avancee_seuil
        );
        if (avRule || lRule) {
          poteau = "⚠️ Poteau intermédiaire obligatoire";
        }
      }

      setResultats({
        dimensions: `${l} x ${a} mm`,
        surface: `${surface.toFixed(2)} m²`,
        poteau,
        pente,
        nbLames
      });

    } catch (err) {
      console.error("Erreur analyse pergola:", err);
      alert("Erreur de chargement ou de traitement du fichier JSON.");
    }
  };

  return (
    <div className="card">
      <img src="images/logo.png" alt="Var Pose Alu" className="logo" />
      <h1>Vérification Limites Pergola</h1>

      <div>
        <label>Type de lames</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 bg-gray-800 rounded">
          <option value="lames_simples">Lames simples</option>
          <option value="lames_tubulaires">Lames tubulaires</option>
        </select>
      </div>

      <div>
        <label>Configuration</label>
        <select value={config} onChange={(e) => setConfig(e.target.value)} className="w-full p-2 bg-gray-800 rounded">
          <option value="1_poutre_1_verin">1 poutre 1 vérin</option>
          <option value="1_poutre_2_verins">1 poutre 2 vérins</option>
          <option value="2_poutres_2_verins">2 poutres 2 vérins</option>
        </select>
      </div>

      <div>
        <label>Longueur (mm)</label>
        <input type="number" value={longueur} onChange={(e) => setLongueur(e.target.value)} className="w-full p-2 bg-gray-800 rounded" />
      </div>

      <div>
        <label>Avancée (mm)</label>
        <input type="number" value={avancee} onChange={(e) => setAvancee(e.target.value)} className="w-full p-2 bg-gray-800 rounded" />
      </div>

      <button onClick={handleValider} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold p-2 rounded">
        Valider
      </button>

      {resultats && (
        <div className="result-box">
          <p><strong>Dimensions :</strong> {resultats.dimensions}</p>
          <p><strong>Surface :</strong> {resultats.surface}</p>
          <p><strong>Nombre de lames :</strong> {resultats.nbLames}</p>
          <p><strong>Pente :</strong> {resultats.pente}</p>
          <p><strong>Poteau :</strong> {resultats.poteau}</p>
        </div>
      )}
    </div>
  );
}
