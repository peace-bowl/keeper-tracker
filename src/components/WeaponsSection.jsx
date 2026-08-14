import { Crosshair, Plus, Dices, Trash2 } from 'lucide-react';
import { getDamageBonusAndBuild } from '../utils/cocRules';
import RetroNumberInput from './RetroNumberInput';

export default function WeaponsSection({
  character,
  onUpdateWeapon,
  onAddWeapon,
  onDeleteWeapon,
  onTriggerRoll
}) {
  const [showAddWeapon, setShowAddWeapon] = useState(false);
  const [name, setName] = useState('');
  const [skillName, setSkillName] = useState('Handgun');
  const [skillValue, setSkillValue] = useState(50);
  const [damage, setDamage] = useState('1D10');
  const [range, setRange] = useState('15 yds');
  const [attacks] = useState('1 (2)');
  const [ammoMax, setAmmoMax] = useState(6);

  const { db, build } = getDamageBonusAndBuild(character.stats?.STR, character.stats?.SIZ);

  const handleCreateWeapon = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddWeapon({
      id: `wep-${Date.now()}`,
      name: name.trim(),
      skillName,
      skillValue: Number(skillValue),
      damage,
      range,
      attacksPerRound: attacks,
      ammoCurrent: Number(ammoMax),
      ammoMax: Number(ammoMax),
      malfunction: 98
    });

    setName('');
    setShowAddWeapon(false);
  };

  const handleAmmoAdjust = (weaponId, delta) => {
    const target = character.weapons.find(w => w.id === weaponId);
    if (!target) return;
    const newAmmo = Math.max(0, Math.min(target.ammoMax, (target.ammoCurrent || 0) + delta));
    onUpdateWeapon(weaponId, { ammoCurrent: newAmmo });
  };

  return (
    <div className="space-y-4">
      {/* Damage Bonus & Build Summary Bar - 1960s Tactical Spec Bar */}
      <div className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-3 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] flex items-center justify-between font-typewriter text-xs shadow-retro-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="dark:text-[#A8B2AC] text-[#5A6861] uppercase font-bold">Damage Bonus (DB): </span>
            <span className="text-[#E65A2B] font-bold text-sm">{db}</span>
          </div>
          <span className="dark:text-[#3D4B44] text-[#C8BFB0]">|</span>
          <div>
            <span className="dark:text-[#A8B2AC] text-[#5A6861] uppercase font-bold">Build Rating: </span>
            <span className="text-[#D99F26] font-bold text-sm">{build}</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddWeapon(!showAddWeapon)}
          className="flex items-center gap-1.5 text-xs font-display uppercase font-bold text-[#F4EFE3] bg-[#E65A2B] border-2 dark:border-[#090C0A] border-[#1C201D] px-3 py-1 rounded-sm btn-retro shadow-retro-orange"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Issue New Weapon</span>
        </button>
      </div>

      {/* Add Custom Weapon Form */}
      {showAddWeapon && (
        <form onSubmit={handleCreateWeapon} className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-4 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] space-y-3 text-xs shadow-retro">
          <div className="font-display font-bold uppercase text-[#D99F26] text-xs tracking-wider">New Armory Inventory Entry</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-typewriter">
            <div>
              <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold uppercase block mb-1">Weapon Designation</label>
              <input
                type="text"
                placeholder="e.g. .38 Revolver"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-2.5 py-1 dark:text-[#EBE6DB] text-[#161B18]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold uppercase block mb-1">Skill & Score %</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Handgun"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-2 py-1 dark:text-[#EBE6DB] text-[#161B18]"
                />
                <RetroNumberInput
                  min={0}
                  max={99}
                  value={skillValue}
                  onChange={(val) => setSkillValue(val)}
                  className="w-20 shrink-0"
                  inputClassName="text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold uppercase block mb-1">Damage Rating</label>
              <input
                type="text"
                placeholder="1D10, 1D6+DB"
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
                className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-2 py-1 dark:text-[#EBE6DB] text-[#161B18] font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] dark:text-[#A8B2AC] text-[#5A6861] font-bold uppercase block mb-1">Capacity / Range</label>
              <div className="flex gap-1">
                <RetroNumberInput
                  min={0}
                  max={999}
                  placeholder="Ammo"
                  value={ammoMax}
                  onChange={(val) => setAmmoMax(val)}
                  className="w-22 shrink-0"
                  inputClassName="text-sm font-bold text-[#D99F26]"
                />
                <input
                  type="text"
                  placeholder="15 yds"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full dark:bg-[#1C2320] bg-[#EFEAD8] border-2 dark:border-[#2D3732] border-[#1C201D] rounded-sm px-2 py-1 dark:text-[#EBE6DB] text-[#161B18]"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t dark:border-[#2D3732] border-[#1C201D]">
            <button
              type="button"
              onClick={() => setShowAddWeapon(false)}
              className="px-3 py-1 dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#161B18] font-display uppercase font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-[#D99F26] text-[#141816] font-display uppercase font-bold rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro"
            >
              Confirm Entry
            </button>
          </div>
        </form>
      )}

      {/* Weapons List */}
      <div className="space-y-2.5">
        {(!character.weapons || character.weapons.length === 0) ? (
          <div className="text-center py-8 text-xs dark:text-[#5A6861] text-[#A8B2AC] font-typewriter uppercase dark:bg-[#141816] bg-[#FAF6EE] rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D]">
            No armory items configured for this dossier.
          </div>
        ) : (
          character.weapons.map((w) => (
            <div
              key={w.id}
              className="dark:bg-[#141816] bg-[#FAF6EE] dark:text-[#EBE6DB] text-[#161B18] p-3.5 rounded-sm border-2 dark:border-[#090C0A] border-[#1C201D] flex flex-wrap items-center justify-between gap-3 shadow-retro-sm"
            >
              {/* Weapon Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-[#E65A2B] stroke-[2.5]" />
                  <span className="font-display font-bold text-sm dark:text-[#F4EFE3] text-[#161B18] uppercase tracking-wide">{w.name}</span>
                  <span className="text-xs text-[#D99F26] font-typewriter font-bold">
                    ({w.skillName || 'Attack'} {w.skillValue}%)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs dark:text-[#A8B2AC] text-[#5A6861] font-typewriter">
                  <span>DAMAGE: <strong className="text-[#E65A2B]">{w.damage}</strong></span>
                  <span className="dark:text-[#3D4B44] text-[#C8BFB0]">•</span>
                  <span>RANGE: {w.range || 'Touch'}</span>
                  <span className="dark:text-[#3D4B44] text-[#C8BFB0]">•</span>
                  <span>ATTACKS: {w.attacksPerRound || '1'}</span>
                </div>
              </div>

              {/* Controls: Ammo & Roll Button */}
              <div className="flex items-center gap-3 font-typewriter">
                {w.ammoMax > 0 && (
                  <div className="flex items-center gap-1.5 dark:bg-[#1C2320] bg-[#EFEAD8] px-2.5 py-1 rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] text-xs">
                    <span className="dark:text-[#A8B2AC] text-[#5A6861] text-[10px] font-bold">AMMO:</span>
                    <button
                      onClick={() => handleAmmoAdjust(w.id, -1)}
                      aria-label="Decrease ammo"
                      className="w-5 h-5 bg-[#252E2A] hover:bg-[#E65A2B] text-[#F4EFE3] rounded-sm flex items-center justify-center font-bold border border-[#090C0A]"
                    >
                      -
                    </button>
                    <span className="text-[#D99F26] font-bold px-1.5">{w.ammoCurrent}/{w.ammoMax}</span>
                    <button
                      onClick={() => handleAmmoAdjust(w.id, 1)}
                      aria-label="Increase ammo"
                      className="w-5 h-5 bg-[#252E2A] hover:bg-[#2A6B60] text-[#F4EFE3] rounded-sm flex items-center justify-center font-bold border border-[#090C0A]"
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  onClick={() => onTriggerRoll(`${w.name} Attack`, w.skillValue || 50)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-[#E65A2B] text-[#F4EFE3] font-display uppercase font-bold text-xs border-2 dark:border-[#090C0A] border-[#1C201D] btn-retro shadow-retro-orange"
                >
                  <Dices className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Attack Roll</span>
                </button>

                <button
                  onClick={() => onDeleteWeapon(w.id)}
                  title="Delete weapon"
                  aria-label={`Delete weapon ${w.name}`}
                  className="dark:text-[#A8B2AC] text-[#5A6861] hover:text-[#E65A2B] p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

