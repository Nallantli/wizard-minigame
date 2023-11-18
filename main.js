function menuGameLoop(timeMs) {
	sprites.START_128x48.draw(ctx, scale(240 - 64), scale(187 - 24), scale(128), scale(48), 0, false);

	makeInteractable(scale(240 - 64), scale(187 - 24), scale(128), scale(48),
		({ x, y, sizeX, sizeY }) => {
			sprites.START_128x48.draw(ctx, x, y, sizeX, sizeY, 0, false);
		},
		({ x, y, sizeX, renderCallback }) => {
			renderCallback();
			ctx.fillStyle = 'white';
			ctx.fillRect(x, y + scale(52), sizeX, scale(4));
		},
		() => {
			generateBattleState(timeMs);
			printMap(state.mapState.map);
			state = {
				...state,
				path: 'MAP'
			};
		});

	makeInteractable(scale(240 - 32), scale(232), scale(64), scale(12),
		({ x, y, sizeX, sizeY }) => {
			sprites.EDIT_DECKS_64x12.draw(ctx, x, y, sizeX, sizeY);
		},
		({ x, y, sizeX, renderCallback }) => {
			renderCallback();
			ctx.fillStyle = 'white';
			ctx.fillRect(x, y + scale(14), sizeX, scale(4))
		},
		() => state.path = 'DECK');

	/* makeInteractable(scale(240 - 32), scale(252), scale(64), scale(12),
		({ x, y, sizeX, sizeY }) => {
			sprites.CUSTOMIZE_64x12.draw(ctx, x, y, sizeX, sizeY);
		},
		({ x, y, sizeX, renderCallback }) => {
			renderCallback();
			ctx.fillStyle = 'white';
			ctx.fillRect(x, y + scale(14), sizeX, scale(4))
		},
		() => state.path = 'CUSTOMIZE'); */

}

function drawEntityIcon(entity, i, si) {
	makeInteractable(scale(16), scale(48) + i * scale(31), scale(32), scale(32),
		({ x, y, sizeX, sizeY }) => {
			sprites.ENTITY_SELECT_32x32.draw(ctx, x + scale(5), y, sizeX, sizeY);
			entity.idleSprite.draw(ctx, x + scale(5), y, sizeX, sizeY);
		},
		({ x, y, sizeX, sizeY }) => {
			sprites.ENTITY_SELECT_32x32.draw(ctx, x, y, sizeX, sizeY);
			entity.idleSprite.draw(ctx, x, y, sizeX, sizeY);
		},
		() => state.deckState.currentIndex = si,
		{
			forceHoverOn: () => state.deckState.currentIndex === si
		});
}

function deckGameLoop(timeMs) {
	let toolTips = [];

	drawEntityIcon(state.player, 0, -1);

	// entities.forEach((entity, i) => drawEntityIcon(entity, i + 2, i));

	const currentEntity = state.player // state.deckState.currentIndex === -1 ? state.player : entities[state.deckState.currentIndex];

	sprites.ELEMENTS_MINOR_8x8.draw(ctx, scale(52), scale(36), scale(8), scale(8), { iIndex: ELEMENT_COLORS[currentEntity.element] });
	font.draw(ctx, scale(62), scale(36), scale(6), scale(8), 0, currentEntity.name);
	font.draw(ctx, scale(68 + currentEntity.name.length * 6), scale(36), scale(6), scale(8), ELEMENT_COLORS[currentEntity.element], `[${currentEntity.health}/${currentEntity.maxHealth}]`);

	sprites.DECK_BACK_252x302.draw(ctx, scale(48), scale(48), scale(252), scale(302));
	let deckIndex = 0;
	const deck = currentEntity.deck;
	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 5; j++) {
			if (deckIndex < deck.length) {
				const card = getSpell(deck[deckIndex]);
				makeInteractable(scale(50 + j * 50), scale(50 + i * 50), scale(48), scale(48),
					({ x, y, sizeX, sizeY }) => {
						card.cardSprite.draw(ctx, x, y, sizeX, sizeY, { cropY: 48 });
					},
					({ x, y, sizeX, sizeY, renderCallback }) => {
						renderCallback();
						sprites.DECK_X_48x48.draw(ctx, x, y, sizeX, sizeY);
						toolTips.push(makeToolTip(
							scale(78),
							scale(114),
							({ x, y }) => {
								card.cardSprite.draw(ctx, x + scale(3), y + scale(3), scale(72), scale(96));
								font.draw(ctx, x + scale(4), y + scale(102), scale(6), scale(8), ELEMENT_COLORS[card.element], card.name);
							}
						));
					},
					() => {
						deck.splice(deckIndex, 1);
					});
			}
			sprites.DECK_SLOT_50x50.draw(ctx, scale(49 + j * 50), scale(49 + i * 50), scale(50), scale(50), { iIndex: deckIndex < deck.length });
			deckIndex++;
		}
	}
	ELEMENT_ID_LIST.forEach((element, i) => {
		makeInteractable(scale(300) + i * scale(31), scale(16), scale(32), scale(32),
			({ x, y, sizeX, sizeY }) => {
				sprites.ELEMENT_SELECT_32x32.draw(ctx, x, y + scale(5), sizeX, sizeY);
				ELEMENT_ICONS[element].draw(ctx, x, y + scale(5), sizeX, sizeY);
			},
			({ x, y, sizeX, sizeY }) => {
				sprites.ELEMENT_SELECT_32x32.draw(ctx, x, y, sizeX, sizeY);
				ELEMENT_ICONS[element].draw(ctx, x, y, sizeX, sizeY);
			},
			() => state.deckState.currentElement = element,
			{
				forceHoverOn: () => state.deckState.currentElement === element
			});
	});

	sprites.DECK_CARDS_164x268.draw(ctx, scale(300), scale(48), scale(164), scale(268));
	getAllSpellsForElement(state.knownSpells, state.deckState.currentElement).forEach((card, i) => {
		makeInteractable(scale(302 + (i % 3) * 50), scale(52 + Math.floor(i / 3) * 66), scale(48), scale(66),
			({ x, y, sizeX }) => {
				if (deck.length === 30 || deck.filter(id => id === card.id).length >= 4) {
					ctx.globalAlpha = 0.5;
				} else {
					ctx.globalAlpha = 1;
				}
				card.cardSprite.draw(ctx, x, y, sizeX, scale(64));
			},
			({ x, y, sizeX, renderCallback }) => {
				renderCallback();
				sprites.DECK_CIRCLE_48x64.draw(ctx, x, y, sizeX, scale(64));
				toolTips.push(makeToolTip(
					scale(78),
					scale(114),
					({ x, y }) => {
						card.cardSprite.draw(ctx, x + scale(3), y + scale(3), scale(72), scale(96));
						font.draw(ctx, x + scale(4), y + scale(102), scale(6), scale(8), ELEMENT_COLORS[card.element], card.name);
					}
				));
			},
			() => {
				if (deck.length < 30 && deck.filter(id => id === card.id).length < 4) {
					deck.push(card.id);
					sortDeck(deck);
				}
			});
	});

	ctx.globalAlpha = 1;
	makeInteractable(scale(480 - 32), scale(375 - 32), scale(32), scale(32),
		({ x, y, sizeX, sizeY }) => sprites.BACK_32x32.draw(ctx, scale(480 - 32), scale(375 - 32), scale(32), scale(32)),
		({ x, y, sizeX, sizeY, renderCallback }) => {
			renderCallback();

			ctx.fillStyle = 'white';
			ctx.fillRect(x - scale(6), y, scale(4), sizeY);
		},
		() => state.path = 'MAP');

	toolTips.forEach(toolTip => toolTip(ctx));

	if (keysUp.includes('escape')) {
		state.path = 'MAP';
	}
}

function customizeGameLoop(timeMs) {
	state.player.idleSprite.draw(ctx, scale(0), scale(187 - 96), scale(192), scale(192));
	state.player.castSprite.draw(ctx, scale(128), scale(187 - 96), scale(192), scale(192));

	let updateOutfits = false;

	let customizeList;
	switch (state.customizeState.currentTab) {
		case 0:
			customizeList = HEADS;
			break;
		case 1:
			customizeList = HATS;
			break;
		case 2:
			customizeList = CLOTHES;
			break;
		case 3:
			customizeList = WANDS;
			break;
	}

	[0, 1, 2, 3].forEach(i => {
		makeInteractable(scale(300) + i * scale(31), scale(16), scale(32), scale(32),
			({ x, y, sizeX, sizeY }) => {
				sprites.ELEMENT_SELECT_32x32.draw(ctx, x, y + scale(5), sizeX, sizeY);
				sprites.CUSTOMIZE_ICONS_16x16.draw(ctx, x, y + scale(5), sizeX, sizeY, { iIndex: i });
			},
			({ x, y, sizeX, sizeY }) => {
				sprites.ELEMENT_SELECT_32x32.draw(ctx, x, y, sizeX, sizeY);
				sprites.CUSTOMIZE_ICONS_16x16.draw(ctx, x, y, sizeX, sizeY, { iIndex: i });
			},
			() => state.customizeState.currentTab = i,
			{
				forceHoverOn: () => state.customizeState.currentTab === i
			});
	});

	sprites.CUSTOMIZE_LIST_136x300.draw(ctx, scale(300), scale(48), scale(136), scale(300));

	Object.values(customizeList).toSorted((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)).forEach((article, i) => {
		makeInteractable(scale(304), scale(52 + i * 22), scale(128), scale(20),
			({ x, y, sizeX, sizeY }) => {
				font.draw(ctx, x + scale(5), y + scale(5), scale(9), scale(12), 0, article.name);
			},
			({ x, y, sizeX, sizeY, renderCallback }) => {
				sprites.TOOLTIP_CORNER_3x3.draw(ctx, x, y, scale(3), scale(3));
				sprites.TOOLTIP_CORNER_3x3.draw(ctx, x + sizeX - scale(3), y, scale(3), scale(3), { iIndex: 1 });
				sprites.TOOLTIP_CORNER_3x3.draw(ctx, x + sizeX - scale(3), y + sizeY - scale(3), scale(3), scale(3), { iIndex: 2 });
				sprites.TOOLTIP_CORNER_3x3.draw(ctx, x, y + sizeY - scale(3), scale(3), scale(3), { iIndex: 3 });

				ctx.fillStyle = "black";
				ctx.fillRect(x + scale(3), y, sizeX - scale(6), scale(3));
				ctx.fillRect(x + scale(3), y + sizeY - scale(3), sizeX - scale(6), scale(3));
				ctx.fillRect(x, y + scale(3), scale(3), sizeY - scale(6));
				ctx.fillRect(x + sizeX - scale(3), y + scale(3), scale(3), sizeY - scale(6));
				ctx.fillRect(x + scale(3), y + scale(3), sizeX - scale(6), sizeY - scale(6));
				ctx.fillStyle = "white";
				ctx.fillRect(x + scale(3), y, sizeX - scale(6), scale(1));
				ctx.fillRect(x + scale(3), y + sizeY - scale(1), sizeX - scale(6), scale(1));
				ctx.fillRect(x, y + scale(3), scale(1), sizeY - scale(6));
				ctx.fillRect(x + sizeX - scale(1), y + scale(3), scale(1), sizeY - scale(6));
				renderCallback();
			},
			() => {
				state.customizeState.current[state.customizeState.currentTab] = article;
				updateOutfits = true;
			},
			{
				forceHoverOn: () => state.customizeState.current[state.customizeState.currentTab] === article
			});
	});

	makeInteractable(scale(168 - 36), scale(300), scale(16), scale(32),
		({ x, y, sizeX, sizeY }) => sprites.VICTIM_ARROW_8x16.draw(ctx, x, y, sizeX, sizeY, { iIndex: 1 }),
		({ x, y, sizeY, renderCallback }) => {
			renderCallback();

			ctx.fillStyle = 'white';
			ctx.fillRect(x - scale(6), y, scale(4), sizeY);
		},
		() => state.player.element = ELEMENT_ID_LIST[(ELEMENT_COLORS[state.player.element] + 4) % 5]);

	makeInteractable(scale(168 + 20), scale(300), scale(16), scale(32),
		({ x, y, sizeX, sizeY }) => sprites.VICTIM_ARROW_8x16.draw(ctx, x, y, sizeX, sizeY),
		({ x, y, sizeX, sizeY, renderCallback }) => {
			renderCallback();

			ctx.fillStyle = 'white';
			ctx.fillRect(x + sizeX + scale(2), y, scale(4), sizeY);
		},
		() => state.player.element = ELEMENT_ID_LIST[(ELEMENT_COLORS[state.player.element] + 1) % 5]);

	sprites.VICTIM_ARROW_8x16.draw(ctx, scale(168 - 36), scale(300), scale(16), scale(32), { iIndex: 1 });
	sprites.VICTIM_ARROW_8x16.draw(ctx, scale(168 + 20), scale(300), scale(16), scale(32));

	ELEMENT_ICONS[state.player.element].draw(ctx, scale(168 - 16), scale(300), scale(32), scale(32));

	if (updateOutfits) {
		state.player.idleSprite = new CompositeSprite([
			state.customizeState.current[0].idle,
			state.customizeState.current[2].idle,
			state.customizeState.current[1].idle
		], 64, 64, 1);
		state.player.castSprite = new CompositeSprite([
			state.customizeState.current[0].cast,
			state.customizeState.current[2].cast,
			state.customizeState.current[1].cast,
			state.customizeState.current[3].cast
		], 64, 64, 1)
		state.player.deathSprite = new CompositeSprite([
			state.customizeState.current[0].death,
			state.customizeState.current[2].death,
			state.customizeState.current[1].death
		], 64, 64, 10);
	}

	makeInteractable(scale(480 - 32), scale(375 - 32), scale(32), scale(32),
		({ x, y, sizeX, sizeY }) => sprites.BACK_32x32.draw(ctx, scale(480 - 32), scale(375 - 32), scale(32), scale(32)),
		({ x, y, sizeX, sizeY, renderCallback }) => {
			renderCallback();

			ctx.fillStyle = 'white';
			ctx.fillRect(x - scale(6), y, scale(4), sizeY);
		},
		() => state.path = 'MENU');
}

function getTileAt(map, x, y) {
	if (x >= 0 && x < map.length && y >= 0 && y < map[0].length) {
		return map[x][y];
	}
	return 0;
}

function getFloodVisible(map, x, y, maxDist, data) {
	let openClass = [{ x, y }];
	let dists = { [`${x}_${y}`]: 0 };
	let visited = [];

	while (openClass.length > 0) {
		const top = openClass.pop();
		const dist = dists[`${top.x}_${top.y}`];
		visited.push(top);
		if (getTileAt(map, top.x, top.y) <= 0 && dist < maxDist) {
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (i === 0 && j === 0) {
						continue;
					}
					const newDist = dist + Math.sqrt(i * i + j * j);
					if (dists[`${top.x + i}_${top.y + j}`] === undefined || dists[`${top.x + i}_${top.y + j}`] > newDist) {
						openClass.push({ x: top.x + i, y: top.y + j });
						dists[`${top.x + i}_${top.y + j}`] = newDist
					}
				}
			}
		}
	}
	return visited.map(({ x, y }) => ({
		x,
		y,
		dist: dists[`${x}_${y}`]
	}));
}

function getStartAndEndRooms(rooms, map, crossings) {

	let roomsWithOneCrossing = rooms.filter(({ id }) => crossings.filter(({ leftId, rightId }) => leftId === id || rightId === id).length === 1);
	shuffleArray(roomsWithOneCrossing);
	const startingRoom = roomsWithOneCrossing.pop();
	const endingRoom = roomsWithOneCrossing.pop();

	for (let i = startingRoom.x + 1; i < startingRoom.x + startingRoom.sizeX; i++) {
		for (let j = startingRoom.y + 1; j < startingRoom.y + startingRoom.sizeY; j++) {
			map[i][j] = -1;
		}
	}

	for (let i = endingRoom.x + 1; i < endingRoom.x + endingRoom.sizeX; i++) {
		for (let j = endingRoom.y + 1; j < endingRoom.y + endingRoom.sizeY; j++) {
			map[i][j] = -1;
		}
	}

	const exitStairs = {
		x: Math.floor(endingRoom.x + endingRoom.sizeX / 2),
		y: Math.floor(endingRoom.y + endingRoom.sizeY / 2)
	};
	map[exitStairs.x][exitStairs.y] = 3;

	const endRoomCrossing = crossings.find(({ leftId, rightId }) => leftId === endingRoom.id || rightId === endingRoom.id);
	map[endRoomCrossing.x][endRoomCrossing.y] = 2;

	return {
		startingRoom,
		endRoomCrossing,
		endingRoom,
		exitStairs,
		roomsWithOneCrossing
	}
}

function generateLevel2(timeMs) {
	const { rooms, map, crossings } = generateDungeon(30, 30, 5, 5, 10, 10);
	const { startingRoom, endRoomCrossing, endingRoom, exitStairs, roomsWithOneCrossing } = getStartAndEndRooms(rooms, map, crossings);

	let enemyRooms = rooms.filter(({ x, y, sizeX, sizeY, id }) => sizeX * sizeY > 15 && !(x === 0 && y === 0) && id !== startingRoom.id && id !== endingRoom.id);
	shuffleArray(enemyRooms);

	let enemies = [];
	let roomWithEnemiesIds = [];
	for (let i = 0; i < 6; i++) {
		const room = enemyRooms.pop();
		if (!room) {
			break;
		}
		roomWithEnemiesIds.push(room.id);
		if (room.sizeX * room.sizeY > 40) {
			enemies.push({
				id: `enemy.${i}-1.${room.id}`,
				x: room.x + room.sizeX / 2 - 0.5,
				y: room.y + room.sizeY / 2 - 0.5,
				mirror: Math.random() <= 0.5,
				roomId: room.id,
				model: {
					...randomFromList(level2Creatures),
					id: crypto.randomUUID()
				}
			});
			enemies.push({
				id: `enemy.${i}-2.${room.id}`,
				x: room.x + room.sizeX / 2 + 1.5,
				y: room.y + room.sizeY / 2 + 1.5,
				mirror: Math.random() <= 0.5,
				roomId: room.id,
				model: {
					...randomFromList(level2Creatures),
					id: crypto.randomUUID()
				}
			});
		} else {
			enemies.push({
				id: `enemy.${i}.${room.id}`,
				x: room.x + room.sizeX / 2 + 0.5,
				y: room.y + room.sizeY / 2 + 0.5,
				mirror: Math.random() <= 0.5,
				roomId: room.id,
				model: {
					...randomFromList(level2Creatures),
					id: crypto.randomUUID()
				}
			});
		}
	}

	let freeRooms = rooms.filter(room => !roomWithEnemiesIds.includes(room.id) && room.id !== startingRoom.id && room.id !== endingRoom.id);
	shuffleArray(freeRooms);

	let items = [];
	for (let i = 0; i < 5; i++) {
		const room = freeRooms.pop();
		if (!room) {
			break;
		}
		const coinAmount = 1 + Math.round(Math.random() * 3);
		for (let j = 0; j < coinAmount; j++) {
			const x = room.x + (room.sizeX - 2) * Math.random() + 2;
			const y = room.y + (room.sizeY - 2) * Math.random() + 2;

			items.push({
				id: crypto.randomUUID(),
				x,
				y,
				type: 'heal_coin',
				value: 50,
				roomId: room.id,
				sprite: sprites.HEAL_COIN_16x16
			});
		}
	}

	let freeRoomsWithOneCrossing = roomsWithOneCrossing.filter(({ id }) => id !== startingRoom.id && id !== endingRoom.id);
	shuffleArray(freeRoomsWithOneCrossing);
	const level3SpellsToDistribute = [
		...level3Spells
	];
	shuffleArray(level3SpellsToDistribute);
	level3SpellsToDistribute.forEach((spell, i) => {
		const room = freeRoomsWithOneCrossing[i % freeRoomsWithOneCrossing.length];
		const x = room.x + (room.sizeX - 2) * Math.random() + 2;
		const y = room.y + (room.sizeY - 2) * Math.random() + 2;
		items.push({
			id: crypto.randomUUID(),
			x,
			y,
			type: 'spell_card',
			spell,
			roomId: room.id,
			sprite: ELEMENT_CARD_ITEMS[getSpell(spell).element]
		});
	});

	state.mapState = {
		rooms,
		map,
		crossings,
		lastTimeMs: timeMs,
		tileSize: 32,
		endRoomCrossing,
		exitStairs,
		entities: [
			{ id: 'player_character', x: startingRoom.x + 2, y: startingRoom.y + 2, mirror: false },
			...enemies
		],
		items
	};
}

function generateLevel1(timeMs) {
	const { rooms, map, crossings } = generateDungeon(30, 30, 5, 5, 10, 10);
	const { startingRoom, endRoomCrossing, endingRoom, exitStairs, roomsWithOneCrossing } = getStartAndEndRooms(rooms, map, crossings);

	let enemyRooms = rooms.filter(({ x, y, sizeX, sizeY, id }) => sizeX * sizeY > 15 && !(x === 0 && y === 0) && id !== startingRoom.id && id !== endingRoom.id);
	shuffleArray(enemyRooms);

	let enemies = [];
	let roomWithEnemiesIds = [];
	for (let i = 0; i < 4; i++) {
		const room = enemyRooms.pop();
		if (!room) {
			break;
		}
		roomWithEnemiesIds.push(room.id);
		enemies.push({
			id: `enemy.${i}.${room.id}`,
			x: room.x + room.sizeX / 2 + 0.5,
			y: room.y + room.sizeY / 2 + 0.5,
			mirror: Math.random() <= 0.5,
			roomId: room.id,
			model: {
				...randomFromList(level1Creatures),
				id: crypto.randomUUID()
			}
		});
	}

	let freeRooms = rooms.filter(room => !roomWithEnemiesIds.includes(room.id) && room.id !== startingRoom.id && room.id !== endingRoom.id);
	shuffleArray(freeRooms);

	let items = [];
	for (let i = 0; i < 10; i++) {
		const room = freeRooms.pop();
		if (!room) {
			break;
		}
		const coinAmount = 1 + Math.round(Math.random() * 3);
		for (let j = 0; j < coinAmount; j++) {
			const x = room.x + (room.sizeX - 2) * Math.random() + 2;
			const y = room.y + (room.sizeY - 2) * Math.random() + 2;

			items.push({
				id: crypto.randomUUID(),
				x,
				y,
				type: 'heal_coin',
				value: 50,
				roomId: room.id,
				sprite: sprites.HEAL_COIN_16x16
			});
		}
	}

	let freeRoomsWithOneCrossing = roomsWithOneCrossing.filter(({ id }) => id !== startingRoom.id && id !== endingRoom.id);
	shuffleArray(freeRoomsWithOneCrossing);
	const level2SpellsToDistribute = [
		...level2Spells
	];
	shuffleArray(level2SpellsToDistribute);
	level2SpellsToDistribute.forEach((spell, i) => {
		const room = freeRoomsWithOneCrossing[i % freeRoomsWithOneCrossing.length];
		const x = room.x + (room.sizeX - 2) * Math.random() + 2;
		const y = room.y + (room.sizeY - 2) * Math.random() + 2;
		items.push({
			id: crypto.randomUUID(),
			x,
			y,
			type: 'spell_card',
			spell,
			roomId: room.id,
			sprite: ELEMENT_CARD_ITEMS[getSpell(spell).element]
		});
	});

	state.mapState = {
		rooms,
		map,
		crossings,
		lastTimeMs: timeMs,
		tileSize: 32,
		endRoomCrossing,
		exitStairs,
		entities: [
			{ id: 'player_character', x: startingRoom.x + 2, y: startingRoom.y + 2, mirror: false },
			...enemies
		],
		items
	};
}

function mapGameLoop(timeMs) {
	const playerCharacterIndex = state.mapState.entities.findIndex(({ id }) => id === 'player_character');
	const passedTimeMs = timeMs - state.mapState.lastTimeMs;
	state.mapState.lastTimeMs = timeMs;

	if (keys['a']) {
		state.mapState.entities[playerCharacterIndex].x -= 0.005 * passedTimeMs;
		state.mapState.entities[playerCharacterIndex].mirror = true;

		if (getTileAt(state.mapState.map, Math.floor(state.mapState.entities[playerCharacterIndex].x), Math.floor(state.mapState.entities[playerCharacterIndex].y)) > 0) {
			state.mapState.entities[playerCharacterIndex].x += 0.005 * passedTimeMs;
		}
	}

	if (keys['d']) {
		state.mapState.entities[playerCharacterIndex].x += 0.005 * passedTimeMs;
		state.mapState.entities[playerCharacterIndex].mirror = false;

		if (getTileAt(state.mapState.map, Math.floor(state.mapState.entities[playerCharacterIndex].x), Math.floor(state.mapState.entities[playerCharacterIndex].y)) > 0) {
			state.mapState.entities[playerCharacterIndex].x -= 0.005 * passedTimeMs;
		}
	}

	if (keys['w']) {
		state.mapState.entities[playerCharacterIndex].y -= 0.005 * passedTimeMs;

		if (getTileAt(state.mapState.map, Math.floor(state.mapState.entities[playerCharacterIndex].x), Math.floor(state.mapState.entities[playerCharacterIndex].y)) > 0) {
			state.mapState.entities[playerCharacterIndex].y += 0.005 * passedTimeMs;
		}
	}

	if (keys['s']) {
		state.mapState.entities[playerCharacterIndex].y += 0.005 * passedTimeMs;

		if (getTileAt(state.mapState.map, Math.floor(state.mapState.entities[playerCharacterIndex].x), Math.floor(state.mapState.entities[playerCharacterIndex].y)) > 0) {
			state.mapState.entities[playerCharacterIndex].y -= 0.005 * passedTimeMs;
		}
	}

	const { tileSize, entities, items } = state.mapState;

	let entitiesNear = entities.filter(entity => {
		if (entity.id === 'player_character') {
			return false;
		}
		if (Math.abs(entity.x - state.mapState.entities[playerCharacterIndex].x) <= 1
			&& Math.abs(entity.y - state.mapState.entities[playerCharacterIndex].y) <= 1) {
			return true;
		}
		return false;
	});

	let itemsNear = items.filter(entity => {
		if (Math.abs(entity.x - state.mapState.entities[playerCharacterIndex].x) <= 1
			&& Math.abs(entity.y - state.mapState.entities[playerCharacterIndex].y) <= 1) {
			return true;
		}
		return false;
	});

	const cameraPosX = state.mapState.entities[playerCharacterIndex].x - 240 / tileSize;
	const cameraPosY = state.mapState.entities[playerCharacterIndex].y - 187 / tileSize;

	const maxDist = 8;
	const cutoff = 5;
	const floodVisible = getFloodVisible(state.mapState.map, Math.floor(state.mapState.entities[playerCharacterIndex].x), Math.floor(state.mapState.entities[playerCharacterIndex].y), maxDist);

	const cameraOffsetX = cameraPosX - Math.floor(cameraPosX);
	const cameraOffsetY = cameraPosY - Math.floor(cameraPosY);
	for (let i = Math.floor(cameraPosX); i < Math.ceil(cameraPosX + (480 / state.mapState.tileSize)); i++) {
		for (let j = Math.floor(cameraPosY); j < Math.ceil(cameraPosY + (375 / state.mapState.tileSize)); j++) {
			const tile = getTileAt(state.mapState.map, i, j);
			const knownIndex = floodVisible.findIndex(({ x, y }) => x === i && y === j);
			if (knownIndex !== -1) {
				ctx.globalAlpha = floodVisible[knownIndex].dist < cutoff ? 1 : (1 - ((floodVisible[knownIndex].dist - cutoff) / cutoff));
				switch (tile) {
					case -1:
						sprites.PLANKS_32x32.draw(ctx, scale((i - cameraPosX) * tileSize), scale((j - cameraPosY) * tileSize), scale(tileSize), scale(tileSize));
						break;
					case 0:
						sprites.GROUND_32x32.draw(ctx, scale((i - cameraPosX) * tileSize), scale((j - cameraPosY) * tileSize), scale(tileSize), scale(tileSize));
						break;
					case 1:
						const neighborArray = [
							getTileAt(state.mapState.map, i, j - 1) === tile,
							getTileAt(state.mapState.map, i - 1, j) === tile,
							getTileAt(state.mapState.map, i + 1, j) === tile,
							getTileAt(state.mapState.map, i, j + 1) === tile,
						];
						tiles.BRICK.draw(ctx, scale((i - cameraPosX) * tileSize), scale((j - cameraPosY) * tileSize), scale(tileSize), scale(tileSize), neighborArray);
						break;
					case 2:
						sprites.LOCKED_DOOR_32x32.draw(ctx, scale((i - cameraPosX) * tileSize), scale((j - cameraPosY) * tileSize), scale(tileSize), scale(tileSize));
						break;
					case -2:
						sprites.UNLOCKED_DOOR_32x32.draw(ctx, scale((i - cameraPosX) * tileSize), scale((j - cameraPosY) * tileSize), scale(tileSize), scale(tileSize));
						break;
					case 3:
						sprites.STAIRS_32x32.draw(ctx, scale((i - cameraPosX) * tileSize), scale((j - cameraPosY) * tileSize), scale(tileSize), scale(tileSize));
						break;
				}
			}
		}
	}
	ctx.globalAlpha = 1;
	const healthString = String(state.player.health);
	numberText.draw(ctx, scale(16), scale(22), scale(4), scale(6), 0, healthString);
	const healthBarWidth = Math.round(106 * state.player.health / state.player.maxHealth);
	ctx.fillStyle = 'white';
	ctx.fillRect(scale(16), scale(16), scale(healthBarWidth), scale(4));

	items.forEach(item => {
		if (item.x > Math.floor(cameraPosX) && item.x < Math.ceil(cameraPosX + (480 / state.mapState.tileSize))
			&& item.y > Math.floor(cameraPosY) && item.y < Math.ceil(cameraPosY + (375 / state.mapState.tileSize))) {
			const knownIndex = floodVisible.findIndex(({ x, y }) => x === Math.floor(item.x) && y === Math.floor(item.y));
			if (knownIndex !== -1) {
				ctx.globalAlpha = floodVisible[knownIndex].dist < cutoff ? 1 : (1 - ((floodVisible[knownIndex].dist - cutoff) / cutoff));
				item.sprite.draw(ctx, scale((item.x - cameraPosX - 0.5) * tileSize), scale((item.y - cameraPosY - 0.5) * tileSize), scale(tileSize / 2), scale(tileSize / 2), { iIndex: state.iterator });
			}
		}
	});

	entities.forEach(entity => {
		let model;
		if (entity.id === 'player_character') {
			model = state.player;
		} else {
			model = entity.model;
		}
		if (entity.x > Math.floor(cameraPosX) && entity.x < Math.ceil(cameraPosX + (480 / state.mapState.tileSize))
			&& entity.y > Math.floor(cameraPosY) && entity.y < Math.ceil(cameraPosY + (375 / state.mapState.tileSize))) {
			const knownIndex = floodVisible.findIndex(({ x, y }) => x === Math.floor(entity.x) && y === Math.floor(entity.y));
			if (knownIndex !== -1) {
				ctx.globalAlpha = floodVisible[knownIndex].dist < cutoff ? 1 : (1 - ((floodVisible[knownIndex].dist - cutoff) / cutoff));
				model.idleSprite.draw(ctx, scale((entity.x - cameraPosX - 1) * tileSize), scale((entity.y - cameraPosY - 1) * tileSize), scale(tileSize * 2), scale(tileSize * 2), { mirror: entity.mirror, iIndex: state.iterator });

				drawBox(ctx, scale((entity.x - cameraPosX) * tileSize - model.name.length * 3 - 6), scale((entity.y - cameraPosY - 1) * tileSize - 9), scale(model.name.length * 6 + 14), scale(13));
				sprites.ELEMENTS_MINOR_8x8.draw(ctx, scale((entity.x - cameraPosX) * tileSize - model.name.length * 3 - 3), scale((entity.y - cameraPosY - 1) * tileSize - 6), scale(8), scale(8), { iIndex: ELEMENT_COLORS[model.element] });
				font.draw(ctx, scale((entity.x - cameraPosX) * tileSize - model.name.length * 3 + 6), scale((entity.y - cameraPosY - 1) * tileSize - 6), scale(6), scale(8), 0, model.name);
			}
		}
	});

	if (itemsNear.length > 0) {
		let removeItemIds = [];
		itemsNear.forEach(item => {
			switch (item.type) {
				case 'heal_coin':
					if (state.player.health < state.player.maxHealth) {
						state.player.health = Math.min(state.player.health + item.value, state.player.maxHealth);
						removeItemIds.push(item.id);
						const newItemSound = new Audio('./audio/item.wav');
						newItemSound.volume = 0.1;
						newItemSound.play();
					}
					break;
				case 'spell_card':
					state.overlayAnimationQueue.push(new AnimationEngine({
						ticks: 10,
						actions: createCardDropSequence(getSpell(item.spell))
					}, TICK_TIME, FPS, canvas, ctx, reduceOverlayAnimationQueue));
					removeItemIds.push(item.id);
					state.knownSpells.push(item.spell);
					const newItemSound = new Audio('./audio/item.wav');
					newItemSound.volume = 0.1;
					newItemSound.play();
					break;
			}
		});
		state.mapState.items = items.filter(({ id }) => !removeItemIds.includes(id));
	}

	if (entitiesNear.length > 0) {
		const roomId = entitiesNear[0].roomId;
		const entitiesInRoom = entities.filter(entity => entity.roomId === roomId).map(({ model }) => model);
		const goLeft = Math.random() <= 0.5;
		console.log(entitiesInRoom);
		battleTrack.play();
		state = {
			...state,
			path: 'BATTLE',
			battleState: generateBattleState((goLeft ? [state.player] : entitiesInRoom), (goLeft ? entitiesInRoom : [state.player]),
				() => {
					battleTrack.pause();
					battleTrack.currentTime = 0;
					console.log("you win!");
					state.mapState.entities = state.mapState.entities.filter(entity => entity.roomId !== roomId);
					if (state.mapState.entities.length === 1) {
						state.mapState.map[state.mapState.endRoomCrossing.x][state.mapState.endRoomCrossing.y] = -2;
					}
					state.path = 'MAP';
				},
				() => {
					battleTrack.pause();
					battleTrack.currentTime = 0;
					console.log("you lose");
					state.mapState = undefined;
					state.path = 'LOSE';
					state.player.health = state.player.maxHealth;
					state.animationQueue.push(new AnimationEngine({
						ticks: 20,
						actions: [
							{
								tick: 0,
								type: ATYPES.INITIALIZE_ENTITY,
								id: 'you_died',
								sprite: sprites.YOU_DIED_160x64,
								alpha: 0,
								posX: scale(240 - 80),
								posY: scale(187 - 64),
								sizeX: scale(160),
								sizeY: scale(64),
								rot: 0,
								zIndex: 0
							},
							{
								startTick: 0,
								endTick: 19,
								type: ATYPES.CHANGE_OPACITY,
								id: 'you_died',
								alpha: 1,
								ease: EASE_TYPES.EASE_IN
							}
						]
					}, TICK_TIME, FPS, canvas, ctx, reduceAnimationQueue));
				})
		};
	}

	if (Math.abs(state.mapState.exitStairs.x - state.mapState.entities[playerCharacterIndex].x) + Math.abs(state.mapState.exitStairs.y - state.mapState.entities[playerCharacterIndex].y) < 1) {
		switch (state.level) {
			case 1:
				state.path = 'LEVEL';
				state.level = 2;
				levelUpSound.play();
				keys = {};
				state.player.maxHealth *= 1.25;
				state.player.health = state.player.maxHealth;
				state.player.criticalRating += 40;
				state.player.superVrilChance += 0.1;
				break;
		}
	}

	if (keysUp.includes('escape')) {
		state.path = 'DECK';
	}
}

function loseGameLoop(timeMs) {
	sprites.YOU_DIED_160x64.draw(ctx, scale(240 - 80), scale(187 - 64), scale(160), scale(64));

	makeInteractable(scale(240 - 10 * 3), scale(192), scale(10 * 6), scale(12),
		({ x, y, sizeX, sizeY }) => {
			font.draw(ctx, x, y, scale(6), scale(8), 0, 'Try Again?');
		},
		({ x, y, sizeX, renderCallback }) => {
			renderCallback();
			ctx.fillStyle = 'white';
			ctx.fillRect(x, y + scale(14), sizeX, scale(4))
		},
		() => state.path = 'MENU');
}

function levelGameLoop(timeMs) {
	const levelText = `LEVEL ${state.level}`
	font.draw(ctx, scale(240 - levelText.length * 12), scale(128), scale(24), scale(32), 0, levelText);

	makeInteractable(scale(240 - 5 * 3), scale(192), scale(6 * 5), scale(12),
		({ x, y, sizeX, sizeY }) => {
			font.draw(ctx, x, y, scale(6), scale(8), 0, 'Start');
		},
		({ x, y, sizeX, renderCallback }) => {
			renderCallback();
			ctx.fillStyle = 'white';
			ctx.fillRect(x, y + scale(14), sizeX, scale(4))
		},
		() => {
			switch (state.level) {
				case 1:
					generateLevel1(timeMs);
					printMap(state.mapState.map);
					state = {
						...state,
						path: 'MAP'
					};
					break;
				case 2:
					generateLevel2(timeMs);
					printMap(state.mapState.map);
					state = {
						...state,
						path: 'MAP'
					};
					break;
			}
		});
}

function gameLoop(timeMs) {
	ctx.globalAlpha = 1;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (!state.startTime || timeMs - state.startTime >= 1000 / TICK_TIME) {
		state.startTime = timeMs;
		state.iterator++;
	}

	if (state.animationQueue.length > 0) {
		state.animationQueue[0].runFrame(timeMs);
	} else {
		switch (state.path) {
			case 'DECK':
				deckGameLoop(timeMs);
				break;
			case 'CUSTOMIZE':
				customizeGameLoop(timeMs);
				break;
			case 'MENU':
				menuGameLoop(timeMs);
				break;
			case 'BATTLE':
				battleGameLoop(timeMs);
				break;
			case 'MAP':
				mapGameLoop(timeMs);
				break;
			case 'LOSE':
				loseGameLoop(timeMs);
				break;
			case 'LEVEL':
				levelGameLoop(timeMs);
				break;
		}
	}

	if (state.overlayAnimationQueue.length > 0) {
		state.overlayAnimationQueue[0].runFrame(timeMs);
	}

	keysUp = [];
	clickPos = undefined;
	rightClickPos = undefined;
	window.requestAnimationFrame(gameLoop);
}

window.requestAnimationFrame(gameLoop);