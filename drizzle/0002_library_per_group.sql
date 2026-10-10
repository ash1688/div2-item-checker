-- The library was one list for all gear and one for all weapons; the game keeps it per
-- gear slot and weapon class. Copy each old value to every slot / class, and each
-- unlocked talent to every class / slot that can roll it, then drop the old rows.
INSERT OR IGNORE INTO library_attributes (key, value)
SELECT g.prefix || ':' || substr(a.key, 6), a.value
FROM library_attributes a, (
    SELECT 'gear:Mask' AS prefix
    UNION ALL SELECT 'gear:Chest' AS prefix
    UNION ALL SELECT 'gear:Backpack' AS prefix
    UNION ALL SELECT 'gear:Gloves' AS prefix
    UNION ALL SELECT 'gear:Holster' AS prefix
    UNION ALL SELECT 'gear:Kneepads' AS prefix
) g
WHERE a.key LIKE 'gear:%' AND instr(substr(a.key, 6), ':') = 0;
--> statement-breakpoint
INSERT OR IGNORE INTO library_attributes (key, value)
SELECT g.prefix || ':' || substr(a.key, 8), a.value
FROM library_attributes a, (
    SELECT 'weapon:Rifle' AS prefix
    UNION ALL SELECT 'weapon:Assault Rifle' AS prefix
    UNION ALL SELECT 'weapon:Marksman Rifle' AS prefix
    UNION ALL SELECT 'weapon:Shotgun' AS prefix
    UNION ALL SELECT 'weapon:SMG' AS prefix
    UNION ALL SELECT 'weapon:LMG' AS prefix
    UNION ALL SELECT 'weapon:Pistol' AS prefix
) g
WHERE a.key LIKE 'weapon:%' AND instr(substr(a.key, 8), ':') = 0;
--> statement-breakpoint
DELETE FROM library_attributes
WHERE (key LIKE 'gear:%' AND instr(substr(key, 6), ':') = 0)
   OR (key LIKE 'weapon:%' AND instr(substr(key, 8), ':') = 0);
--> statement-breakpoint
INSERT OR IGNORE INTO library_talents (name)
SELECT m.key
FROM library_talents t JOIN (
    SELECT 'Strained' AS talent, 'weapon:Rifle:Strained' AS key
    UNION ALL SELECT 'Optimist' AS talent, 'weapon:Rifle:Optimist' AS key
    UNION ALL SELECT 'Killer' AS talent, 'weapon:Rifle:Killer' AS key
    UNION ALL SELECT 'Rifleman' AS talent, 'weapon:Rifle:Rifleman' AS key
    UNION ALL SELECT 'Ranger' AS talent, 'weapon:Rifle:Ranger' AS key
    UNION ALL SELECT 'Streamline' AS talent, 'weapon:Rifle:Streamline' AS key
    UNION ALL SELECT 'Breadbasket' AS talent, 'weapon:Rifle:Breadbasket' AS key
    UNION ALL SELECT 'Close & Personal' AS talent, 'weapon:Rifle:Close & Personal' AS key
    UNION ALL SELECT 'Vindictive' AS talent, 'weapon:Rifle:Vindictive' AS key
    UNION ALL SELECT 'Pressure Point' AS talent, 'weapon:Rifle:Pressure Point' AS key
    UNION ALL SELECT 'In Sync' AS talent, 'weapon:Rifle:In Sync' AS key
    UNION ALL SELECT 'Spike' AS talent, 'weapon:Rifle:Spike' AS key
    UNION ALL SELECT 'Future Perfect' AS talent, 'weapon:Rifle:Future Perfect' AS key
    UNION ALL SELECT 'Behind You' AS talent, 'weapon:Rifle:Behind You' AS key
    UNION ALL SELECT 'Determined' AS talent, 'weapon:Rifle:Determined' AS key
    UNION ALL SELECT 'Boomerang' AS talent, 'weapon:Rifle:Boomerang' AS key
    UNION ALL SELECT 'Precision Strike' AS talent, 'weapon:Rifle:Precision Strike' AS key
    UNION ALL SELECT 'Back and Forth' AS talent, 'weapon:Rifle:Back and Forth' AS key
    UNION ALL SELECT 'Sadist' AS talent, 'weapon:Rifle:Sadist' AS key
    UNION ALL SELECT 'Ignited' AS talent, 'weapon:Rifle:Ignited' AS key
    UNION ALL SELECT 'Eyeless' AS talent, 'weapon:Rifle:Eyeless' AS key
    UNION ALL SELECT 'Thunder Strike' AS talent, 'weapon:Rifle:Thunder Strike' AS key
    UNION ALL SELECT 'Immobilize' AS talent, 'weapon:Rifle:Immobilize' AS key
    UNION ALL SELECT 'Head Scratcher' AS talent, 'weapon:Rifle:Head Scratcher' AS key
    UNION ALL SELECT 'Flatline' AS talent, 'weapon:Rifle:Flatline' AS key
    UNION ALL SELECT 'Soft Spot' AS talent, 'weapon:Rifle:Soft Spot' AS key
    UNION ALL SELECT 'Perpetuation' AS talent, 'weapon:Rifle:Perpetuation' AS key
    UNION ALL SELECT 'Reformation' AS talent, 'weapon:Rifle:Reformation' AS key
    UNION ALL SELECT 'Preservation' AS talent, 'weapon:Rifle:Preservation' AS key
    UNION ALL SELECT 'Lucky Shot' AS talent, 'weapon:Rifle:Lucky Shot' AS key
    UNION ALL SELECT 'Fast Hands' AS talent, 'weapon:Rifle:Fast Hands' AS key
    UNION ALL SELECT 'Steady Handed' AS talent, 'weapon:Rifle:Steady Handed' AS key
    UNION ALL SELECT 'Sledgehammer' AS talent, 'weapon:Rifle:Sledgehammer' AS key
    UNION ALL SELECT 'Strained' AS talent, 'weapon:Assault Rifle:Strained' AS key
    UNION ALL SELECT 'Optimist' AS talent, 'weapon:Assault Rifle:Optimist' AS key
    UNION ALL SELECT 'Killer' AS talent, 'weapon:Assault Rifle:Killer' AS key
    UNION ALL SELECT 'Ranger' AS talent, 'weapon:Assault Rifle:Ranger' AS key
    UNION ALL SELECT 'Streamline' AS talent, 'weapon:Assault Rifle:Streamline' AS key
    UNION ALL SELECT 'Breadbasket' AS talent, 'weapon:Assault Rifle:Breadbasket' AS key
    UNION ALL SELECT 'Close & Personal' AS talent, 'weapon:Assault Rifle:Close & Personal' AS key
    UNION ALL SELECT 'Vindictive' AS talent, 'weapon:Assault Rifle:Vindictive' AS key
    UNION ALL SELECT 'Pressure Point' AS talent, 'weapon:Assault Rifle:Pressure Point' AS key
    UNION ALL SELECT 'In Sync' AS talent, 'weapon:Assault Rifle:In Sync' AS key
    UNION ALL SELECT 'Spike' AS talent, 'weapon:Assault Rifle:Spike' AS key
    UNION ALL SELECT 'Future Perfect' AS talent, 'weapon:Assault Rifle:Future Perfect' AS key
    UNION ALL SELECT 'Measured' AS talent, 'weapon:Assault Rifle:Measured' AS key
    UNION ALL SELECT 'Precision Strike' AS talent, 'weapon:Assault Rifle:Precision Strike' AS key
    UNION ALL SELECT 'Back and Forth' AS talent, 'weapon:Assault Rifle:Back and Forth' AS key
    UNION ALL SELECT 'Boiling Point' AS talent, 'weapon:Assault Rifle:Boiling Point' AS key
    UNION ALL SELECT 'Sadist' AS talent, 'weapon:Assault Rifle:Sadist' AS key
    UNION ALL SELECT 'Ignited' AS talent, 'weapon:Assault Rifle:Ignited' AS key
    UNION ALL SELECT 'Eyeless' AS talent, 'weapon:Assault Rifle:Eyeless' AS key
    UNION ALL SELECT 'Thunder Strike' AS talent, 'weapon:Assault Rifle:Thunder Strike' AS key
    UNION ALL SELECT 'Immobilize' AS talent, 'weapon:Assault Rifle:Immobilize' AS key
    UNION ALL SELECT 'Head Scratcher' AS talent, 'weapon:Assault Rifle:Head Scratcher' AS key
    UNION ALL SELECT 'Flatline' AS talent, 'weapon:Assault Rifle:Flatline' AS key
    UNION ALL SELECT 'Soft Spot' AS talent, 'weapon:Assault Rifle:Soft Spot' AS key
    UNION ALL SELECT 'Perpetuation' AS talent, 'weapon:Assault Rifle:Perpetuation' AS key
    UNION ALL SELECT 'Reformation' AS talent, 'weapon:Assault Rifle:Reformation' AS key
    UNION ALL SELECT 'Preservation' AS talent, 'weapon:Assault Rifle:Preservation' AS key
    UNION ALL SELECT 'Fast Hands' AS talent, 'weapon:Assault Rifle:Fast Hands' AS key
    UNION ALL SELECT 'Steady Handed' AS talent, 'weapon:Assault Rifle:Steady Handed' AS key
    UNION ALL SELECT 'Stabilize' AS talent, 'weapon:Assault Rifle:Stabilize' AS key
    UNION ALL SELECT 'Overflowing' AS talent, 'weapon:Assault Rifle:Overflowing' AS key
    UNION ALL SELECT 'Sledgehammer' AS talent, 'weapon:Assault Rifle:Sledgehammer' AS key
    UNION ALL SELECT 'On Empty' AS talent, 'weapon:Assault Rifle:On Empty' AS key
    UNION ALL SELECT 'Near Sighted' AS talent, 'weapon:Assault Rifle:Near Sighted' AS key
    UNION ALL SELECT 'Strained' AS talent, 'weapon:Marksman Rifle:Strained' AS key
    UNION ALL SELECT 'Optimist' AS talent, 'weapon:Marksman Rifle:Optimist' AS key
    UNION ALL SELECT 'Killer' AS talent, 'weapon:Marksman Rifle:Killer' AS key
    UNION ALL SELECT 'Ranger' AS talent, 'weapon:Marksman Rifle:Ranger' AS key
    UNION ALL SELECT 'Streamline' AS talent, 'weapon:Marksman Rifle:Streamline' AS key
    UNION ALL SELECT 'Breadbasket' AS talent, 'weapon:Marksman Rifle:Breadbasket' AS key
    UNION ALL SELECT 'Close & Personal' AS talent, 'weapon:Marksman Rifle:Close & Personal' AS key
    UNION ALL SELECT 'Vindictive' AS talent, 'weapon:Marksman Rifle:Vindictive' AS key
    UNION ALL SELECT 'Pressure Point' AS talent, 'weapon:Marksman Rifle:Pressure Point' AS key
    UNION ALL SELECT 'In Sync' AS talent, 'weapon:Marksman Rifle:In Sync' AS key
    UNION ALL SELECT 'Spike' AS talent, 'weapon:Marksman Rifle:Spike' AS key
    UNION ALL SELECT 'Future Perfect' AS talent, 'weapon:Marksman Rifle:Future Perfect' AS key
    UNION ALL SELECT 'Behind You' AS talent, 'weapon:Marksman Rifle:Behind You' AS key
    UNION ALL SELECT 'Determined' AS talent, 'weapon:Marksman Rifle:Determined' AS key
    UNION ALL SELECT 'Precision Strike' AS talent, 'weapon:Marksman Rifle:Precision Strike' AS key
    UNION ALL SELECT 'Back and Forth' AS talent, 'weapon:Marksman Rifle:Back and Forth' AS key
    UNION ALL SELECT 'Sadist' AS talent, 'weapon:Marksman Rifle:Sadist' AS key
    UNION ALL SELECT 'Ignited' AS talent, 'weapon:Marksman Rifle:Ignited' AS key
    UNION ALL SELECT 'Eyeless' AS talent, 'weapon:Marksman Rifle:Eyeless' AS key
    UNION ALL SELECT 'Thunder Strike' AS talent, 'weapon:Marksman Rifle:Thunder Strike' AS key
    UNION ALL SELECT 'Immobilize' AS talent, 'weapon:Marksman Rifle:Immobilize' AS key
    UNION ALL SELECT 'Head Scratcher' AS talent, 'weapon:Marksman Rifle:Head Scratcher' AS key
    UNION ALL SELECT 'Flatline' AS talent, 'weapon:Marksman Rifle:Flatline' AS key
    UNION ALL SELECT 'Soft Spot' AS talent, 'weapon:Marksman Rifle:Soft Spot' AS key
    UNION ALL SELECT 'Perpetuation' AS talent, 'weapon:Marksman Rifle:Perpetuation' AS key
    UNION ALL SELECT 'Reformation' AS talent, 'weapon:Marksman Rifle:Reformation' AS key
    UNION ALL SELECT 'Preservation' AS talent, 'weapon:Marksman Rifle:Preservation' AS key
    UNION ALL SELECT 'Lucky Shot' AS talent, 'weapon:Marksman Rifle:Lucky Shot' AS key
    UNION ALL SELECT 'First Blood' AS talent, 'weapon:Marksman Rifle:First Blood' AS key
    UNION ALL SELECT 'Naked' AS talent, 'weapon:Marksman Rifle:Naked' AS key
    UNION ALL SELECT 'Fast Hands' AS talent, 'weapon:Marksman Rifle:Fast Hands' AS key
    UNION ALL SELECT 'Steady Handed' AS talent, 'weapon:Marksman Rifle:Steady Handed' AS key
    UNION ALL SELECT 'Sledgehammer' AS talent, 'weapon:Marksman Rifle:Sledgehammer' AS key
    UNION ALL SELECT 'Strained' AS talent, 'weapon:Shotgun:Strained' AS key
    UNION ALL SELECT 'Optimist' AS talent, 'weapon:Shotgun:Optimist' AS key
    UNION ALL SELECT 'Killer' AS talent, 'weapon:Shotgun:Killer' AS key
    UNION ALL SELECT 'Ranger' AS talent, 'weapon:Shotgun:Ranger' AS key
    UNION ALL SELECT 'Streamline' AS talent, 'weapon:Shotgun:Streamline' AS key
    UNION ALL SELECT 'Breadbasket' AS talent, 'weapon:Shotgun:Breadbasket' AS key
    UNION ALL SELECT 'Close & Personal' AS talent, 'weapon:Shotgun:Close & Personal' AS key
    UNION ALL SELECT 'Vindictive' AS talent, 'weapon:Shotgun:Vindictive' AS key
    UNION ALL SELECT 'Pressure Point' AS talent, 'weapon:Shotgun:Pressure Point' AS key
    UNION ALL SELECT 'In Sync' AS talent, 'weapon:Shotgun:In Sync' AS key
    UNION ALL SELECT 'Spike' AS talent, 'weapon:Shotgun:Spike' AS key
    UNION ALL SELECT 'Future Perfect' AS talent, 'weapon:Shotgun:Future Perfect' AS key
    UNION ALL SELECT 'Back and Forth' AS talent, 'weapon:Shotgun:Back and Forth' AS key
    UNION ALL SELECT 'Sadist' AS talent, 'weapon:Shotgun:Sadist' AS key
    UNION ALL SELECT 'Ignited' AS talent, 'weapon:Shotgun:Ignited' AS key
    UNION ALL SELECT 'Eyeless' AS talent, 'weapon:Shotgun:Eyeless' AS key
    UNION ALL SELECT 'Thunder Strike' AS talent, 'weapon:Shotgun:Thunder Strike' AS key
    UNION ALL SELECT 'Immobilize' AS talent, 'weapon:Shotgun:Immobilize' AS key
    UNION ALL SELECT 'Head Scratcher' AS talent, 'weapon:Shotgun:Head Scratcher' AS key
    UNION ALL SELECT 'Flatline' AS talent, 'weapon:Shotgun:Flatline' AS key
    UNION ALL SELECT 'Soft Spot' AS talent, 'weapon:Shotgun:Soft Spot' AS key
    UNION ALL SELECT 'Perpetuation' AS talent, 'weapon:Shotgun:Perpetuation' AS key
    UNION ALL SELECT 'Reformation' AS talent, 'weapon:Shotgun:Reformation' AS key
    UNION ALL SELECT 'Preservation' AS talent, 'weapon:Shotgun:Preservation' AS key
    UNION ALL SELECT 'Pummel' AS talent, 'weapon:Shotgun:Pummel' AS key
    UNION ALL SELECT 'Brazen' AS talent, 'weapon:Shotgun:Brazen' AS key
    UNION ALL SELECT 'Fast Hands' AS talent, 'weapon:Shotgun:Fast Hands' AS key
    UNION ALL SELECT 'Steady Handed' AS talent, 'weapon:Shotgun:Steady Handed' AS key
    UNION ALL SELECT 'Pumped Up' AS talent, 'weapon:Shotgun:Pumped Up' AS key
    UNION ALL SELECT 'Sledgehammer' AS talent, 'weapon:Shotgun:Sledgehammer' AS key
    UNION ALL SELECT 'Strained' AS talent, 'weapon:SMG:Strained' AS key
    UNION ALL SELECT 'Optimist' AS talent, 'weapon:SMG:Optimist' AS key
    UNION ALL SELECT 'Killer' AS talent, 'weapon:SMG:Killer' AS key
    UNION ALL SELECT 'Ranger' AS talent, 'weapon:SMG:Ranger' AS key
    UNION ALL SELECT 'Streamline' AS talent, 'weapon:SMG:Streamline' AS key
    UNION ALL SELECT 'Breadbasket' AS talent, 'weapon:SMG:Breadbasket' AS key
    UNION ALL SELECT 'Close & Personal' AS talent, 'weapon:SMG:Close & Personal' AS key
    UNION ALL SELECT 'Vindictive' AS talent, 'weapon:SMG:Vindictive' AS key
    UNION ALL SELECT 'Pressure Point' AS talent, 'weapon:SMG:Pressure Point' AS key
    UNION ALL SELECT 'In Sync' AS talent, 'weapon:SMG:In Sync' AS key
    UNION ALL SELECT 'Spike' AS talent, 'weapon:SMG:Spike' AS key
    UNION ALL SELECT 'Future Perfect' AS talent, 'weapon:SMG:Future Perfect' AS key
    UNION ALL SELECT 'Measured' AS talent, 'weapon:SMG:Measured' AS key
    UNION ALL SELECT 'Back and Forth' AS talent, 'weapon:SMG:Back and Forth' AS key
    UNION ALL SELECT 'Boiling Point' AS talent, 'weapon:SMG:Boiling Point' AS key
    UNION ALL SELECT 'Sadist' AS talent, 'weapon:SMG:Sadist' AS key
    UNION ALL SELECT 'Ignited' AS talent, 'weapon:SMG:Ignited' AS key
    UNION ALL SELECT 'Eyeless' AS talent, 'weapon:SMG:Eyeless' AS key
    UNION ALL SELECT 'Thunder Strike' AS talent, 'weapon:SMG:Thunder Strike' AS key
    UNION ALL SELECT 'Immobilize' AS talent, 'weapon:SMG:Immobilize' AS key
    UNION ALL SELECT 'Head Scratcher' AS talent, 'weapon:SMG:Head Scratcher' AS key
    UNION ALL SELECT 'Flatline' AS talent, 'weapon:SMG:Flatline' AS key
    UNION ALL SELECT 'Soft Spot' AS talent, 'weapon:SMG:Soft Spot' AS key
    UNION ALL SELECT 'Perpetuation' AS talent, 'weapon:SMG:Perpetuation' AS key
    UNION ALL SELECT 'Reformation' AS talent, 'weapon:SMG:Reformation' AS key
    UNION ALL SELECT 'Preservation' AS talent, 'weapon:SMG:Preservation' AS key
    UNION ALL SELECT 'Fast Hands' AS talent, 'weapon:SMG:Fast Hands' AS key
    UNION ALL SELECT 'Steady Handed' AS talent, 'weapon:SMG:Steady Handed' AS key
    UNION ALL SELECT 'Stabilize' AS talent, 'weapon:SMG:Stabilize' AS key
    UNION ALL SELECT 'Outsider' AS talent, 'weapon:SMG:Outsider' AS key
    UNION ALL SELECT 'Sledgehammer' AS talent, 'weapon:SMG:Sledgehammer' AS key
    UNION ALL SELECT 'Unwavering' AS talent, 'weapon:SMG:Unwavering' AS key
    UNION ALL SELECT 'Strained' AS talent, 'weapon:LMG:Strained' AS key
    UNION ALL SELECT 'Optimist' AS talent, 'weapon:LMG:Optimist' AS key
    UNION ALL SELECT 'Killer' AS talent, 'weapon:LMG:Killer' AS key
    UNION ALL SELECT 'Ranger' AS talent, 'weapon:LMG:Ranger' AS key
    UNION ALL SELECT 'Streamline' AS talent, 'weapon:LMG:Streamline' AS key
    UNION ALL SELECT 'Breadbasket' AS talent, 'weapon:LMG:Breadbasket' AS key
    UNION ALL SELECT 'Overwhelm' AS talent, 'weapon:LMG:Overwhelm' AS key
    UNION ALL SELECT 'Frenzy' AS talent, 'weapon:LMG:Frenzy' AS key
    UNION ALL SELECT 'Close & Personal' AS talent, 'weapon:LMG:Close & Personal' AS key
    UNION ALL SELECT 'Vindictive' AS talent, 'weapon:LMG:Vindictive' AS key
    UNION ALL SELECT 'Pressure Point' AS talent, 'weapon:LMG:Pressure Point' AS key
    UNION ALL SELECT 'In Sync' AS talent, 'weapon:LMG:In Sync' AS key
    UNION ALL SELECT 'Spike' AS talent, 'weapon:LMG:Spike' AS key
    UNION ALL SELECT 'Future Perfect' AS talent, 'weapon:LMG:Future Perfect' AS key
    UNION ALL SELECT 'Measured' AS talent, 'weapon:LMG:Measured' AS key
    UNION ALL SELECT 'Unhinged' AS talent, 'weapon:LMG:Unhinged' AS key
    UNION ALL SELECT 'Precision Strike' AS talent, 'weapon:LMG:Precision Strike' AS key
    UNION ALL SELECT 'Back and Forth' AS talent, 'weapon:LMG:Back and Forth' AS key
    UNION ALL SELECT 'Boiling Point' AS talent, 'weapon:LMG:Boiling Point' AS key
    UNION ALL SELECT 'Sadist' AS talent, 'weapon:LMG:Sadist' AS key
    UNION ALL SELECT 'Ignited' AS talent, 'weapon:LMG:Ignited' AS key
    UNION ALL SELECT 'Eyeless' AS talent, 'weapon:LMG:Eyeless' AS key
    UNION ALL SELECT 'Thunder Strike' AS talent, 'weapon:LMG:Thunder Strike' AS key
    UNION ALL SELECT 'Immobilize' AS talent, 'weapon:LMG:Immobilize' AS key
    UNION ALL SELECT 'Head Scratcher' AS talent, 'weapon:LMG:Head Scratcher' AS key
    UNION ALL SELECT 'Flatline' AS talent, 'weapon:LMG:Flatline' AS key
    UNION ALL SELECT 'Soft Spot' AS talent, 'weapon:LMG:Soft Spot' AS key
    UNION ALL SELECT 'Perpetuation' AS talent, 'weapon:LMG:Perpetuation' AS key
    UNION ALL SELECT 'Reformation' AS talent, 'weapon:LMG:Reformation' AS key
    UNION ALL SELECT 'Preservation' AS talent, 'weapon:LMG:Preservation' AS key
    UNION ALL SELECT 'Fast Hands' AS talent, 'weapon:LMG:Fast Hands' AS key
    UNION ALL SELECT 'Steady Handed' AS talent, 'weapon:LMG:Steady Handed' AS key
    UNION ALL SELECT 'Sledgehammer' AS talent, 'weapon:LMG:Sledgehammer' AS key
    UNION ALL SELECT 'Strained' AS talent, 'weapon:Pistol:Strained' AS key
    UNION ALL SELECT 'Optimist' AS talent, 'weapon:Pistol:Optimist' AS key
    UNION ALL SELECT 'Killer' AS talent, 'weapon:Pistol:Killer' AS key
    UNION ALL SELECT 'Ranger' AS talent, 'weapon:Pistol:Ranger' AS key
    UNION ALL SELECT 'Streamline' AS talent, 'weapon:Pistol:Streamline' AS key
    UNION ALL SELECT 'Breadbasket' AS talent, 'weapon:Pistol:Breadbasket' AS key
    UNION ALL SELECT 'Close & Personal' AS talent, 'weapon:Pistol:Close & Personal' AS key
    UNION ALL SELECT 'Vindictive' AS talent, 'weapon:Pistol:Vindictive' AS key
    UNION ALL SELECT 'Pressure Point' AS talent, 'weapon:Pistol:Pressure Point' AS key
    UNION ALL SELECT 'In Sync' AS talent, 'weapon:Pistol:In Sync' AS key
    UNION ALL SELECT 'Spike' AS talent, 'weapon:Pistol:Spike' AS key
    UNION ALL SELECT 'Future Perfect' AS talent, 'weapon:Pistol:Future Perfect' AS key
    UNION ALL SELECT 'Determined' AS talent, 'weapon:Pistol:Determined' AS key
    UNION ALL SELECT 'Sadist' AS talent, 'weapon:Pistol:Sadist' AS key
    UNION ALL SELECT 'Ignited' AS talent, 'weapon:Pistol:Ignited' AS key
    UNION ALL SELECT 'Eyeless' AS talent, 'weapon:Pistol:Eyeless' AS key
    UNION ALL SELECT 'Thunder Strike' AS talent, 'weapon:Pistol:Thunder Strike' AS key
    UNION ALL SELECT 'Immobilize' AS talent, 'weapon:Pistol:Immobilize' AS key
    UNION ALL SELECT 'Head Scratcher' AS talent, 'weapon:Pistol:Head Scratcher' AS key
    UNION ALL SELECT 'Flatline' AS talent, 'weapon:Pistol:Flatline' AS key
    UNION ALL SELECT 'Soft Spot' AS talent, 'weapon:Pistol:Soft Spot' AS key
    UNION ALL SELECT 'Perpetuation' AS talent, 'weapon:Pistol:Perpetuation' AS key
    UNION ALL SELECT 'Reformation' AS talent, 'weapon:Pistol:Reformation' AS key
    UNION ALL SELECT 'Preservation' AS talent, 'weapon:Pistol:Preservation' AS key
    UNION ALL SELECT 'Lucky Shot' AS talent, 'weapon:Pistol:Lucky Shot' AS key
    UNION ALL SELECT 'Fast Hands' AS talent, 'weapon:Pistol:Fast Hands' AS key
    UNION ALL SELECT 'Steady Handed' AS talent, 'weapon:Pistol:Steady Handed' AS key
    UNION ALL SELECT 'Finisher' AS talent, 'weapon:Pistol:Finisher' AS key
    UNION ALL SELECT 'Salvage' AS talent, 'weapon:Pistol:Salvage' AS key
    UNION ALL SELECT 'Sledgehammer' AS talent, 'weapon:Pistol:Sledgehammer' AS key
    UNION ALL SELECT 'Obliterate' AS talent, 'gear:Chest:Obliterate' AS key
    UNION ALL SELECT 'Glass Cannon' AS talent, 'gear:Chest:Glass Cannon' AS key
    UNION ALL SELECT 'Headhunter' AS talent, 'gear:Chest:Headhunter' AS key
    UNION ALL SELECT 'Kinetic Momentum' AS talent, 'gear:Chest:Kinetic Momentum' AS key
    UNION ALL SELECT 'Intimidate' AS talent, 'gear:Chest:Intimidate' AS key
    UNION ALL SELECT 'Spotter' AS talent, 'gear:Chest:Spotter' AS key
    UNION ALL SELECT 'Overwatch' AS talent, 'gear:Chest:Overwatch' AS key
    UNION ALL SELECT 'Spark' AS talent, 'gear:Chest:Spark' AS key
    UNION ALL SELECT 'Empathic Resolve' AS talent, 'gear:Chest:Empathic Resolve' AS key
    UNION ALL SELECT 'Unbreakable' AS talent, 'gear:Chest:Unbreakable' AS key
    UNION ALL SELECT 'Focus' AS talent, 'gear:Chest:Focus' AS key
    UNION ALL SELECT 'Gunslinger' AS talent, 'gear:Chest:Gunslinger' AS key
    UNION ALL SELECT 'Tag Team' AS talent, 'gear:Chest:Tag Team' AS key
    UNION ALL SELECT 'Skilled' AS talent, 'gear:Chest:Skilled' AS key
    UNION ALL SELECT 'Explosive Delivery' AS talent, 'gear:Chest:Explosive Delivery' AS key
    UNION ALL SELECT 'Vanguard' AS talent, 'gear:Chest:Vanguard' AS key
    UNION ALL SELECT 'Protected Reload' AS talent, 'gear:Chest:Protected Reload' AS key
    UNION ALL SELECT 'Entrench' AS talent, 'gear:Chest:Entrench' AS key
    UNION ALL SELECT 'Efficient' AS talent, 'gear:Chest:Efficient' AS key
    UNION ALL SELECT 'Braced' AS talent, 'gear:Chest:Braced' AS key
    UNION ALL SELECT 'Trauma' AS talent, 'gear:Chest:Trauma' AS key
    UNION ALL SELECT 'Tamper Proof' AS talent, 'gear:Chest:Tamper Proof' AS key
    UNION ALL SELECT 'Mad Bomber' AS talent, 'gear:Chest:Mad Bomber' AS key
    UNION ALL SELECT 'Reassigned' AS talent, 'gear:Chest:Reassigned' AS key
    UNION ALL SELECT 'Vigilance' AS talent, 'gear:Backpack:Vigilance' AS key
    UNION ALL SELECT 'Combined Arms' AS talent, 'gear:Backpack:Combined Arms' AS key
    UNION ALL SELECT 'Concussion' AS talent, 'gear:Backpack:Concussion' AS key
    UNION ALL SELECT 'Composure' AS talent, 'gear:Backpack:Composure' AS key
    UNION ALL SELECT 'Tech Support' AS talent, 'gear:Backpack:Tech Support' AS key
    UNION ALL SELECT 'Wicked' AS talent, 'gear:Backpack:Wicked' AS key
    UNION ALL SELECT 'Bloodsucker' AS talent, 'gear:Backpack:Bloodsucker' AS key
    UNION ALL SELECT 'Versatile' AS talent, 'gear:Backpack:Versatile' AS key
    UNION ALL SELECT 'Unstoppable Force' AS talent, 'gear:Backpack:Unstoppable Force' AS key
    UNION ALL SELECT 'Shock and Awe' AS talent, 'gear:Backpack:Shock and Awe' AS key
    UNION ALL SELECT 'Safeguard' AS talent, 'gear:Backpack:Safeguard' AS key
    UNION ALL SELECT 'Companion' AS talent, 'gear:Backpack:Companion' AS key
    UNION ALL SELECT 'Opportunistic' AS talent, 'gear:Backpack:Opportunistic' AS key
    UNION ALL SELECT 'Clutch' AS talent, 'gear:Backpack:Clutch' AS key
    UNION ALL SELECT 'Adrenaline Rush' AS talent, 'gear:Backpack:Adrenaline Rush' AS key
    UNION ALL SELECT 'Leadership' AS talent, 'gear:Backpack:Leadership' AS key
    UNION ALL SELECT 'Galvanize' AS talent, 'gear:Backpack:Galvanize' AS key
    UNION ALL SELECT 'Overclock' AS talent, 'gear:Backpack:Overclock' AS key
    UNION ALL SELECT 'Creeping Death' AS talent, 'gear:Backpack:Creeping Death' AS key
    UNION ALL SELECT 'Calculated' AS talent, 'gear:Backpack:Calculated' AS key
    UNION ALL SELECT 'Energize' AS talent, 'gear:Backpack:Energize' AS key
    UNION ALL SELECT 'Protector' AS talent, 'gear:Backpack:Protector' AS key
) m ON m.talent = t.name;
--> statement-breakpoint
DELETE FROM library_talents WHERE instr(name, ':') = 0;
