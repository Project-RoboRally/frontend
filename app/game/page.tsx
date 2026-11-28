'use client';

import { Suspense } from 'react';

import Game from '@/components/Game';
import { GameOverlays } from '@/components/game/GameOverlays';
import { PhasePanel } from '@/components/game/PhasePanel';
import { useGame } from '@/components/game/useGame';
import HUD from '@/components/HUD';
import { buttonClassName } from '@/lib/styles';

/**
 * Page for the frontend of the gameboard.
 *
 * @author Caroline, Katarina, Kerem, Elias, Matthias
 */
export default function GamePage() {
  return (
    <Suspense fallback={null}>
      <GameBoard />
    </Suspense>
  );
}

function GameBoard() {
  const game = useGame();

  if (!game.username || !game.player || !game.displayState) {
    return null;
  }

  if (game.showWinner) {
    const winner = game.playerState?.winnerUsername;
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center p-6 text-center">
        <section className="w-full rounded-xl border-2 border-steel-dark bg-charcoal p-10">
          <h1 className="text-4xl font-bold">Game Over</h1>
          <p className="mt-4 text-xl" role="status">
            {winner === game.username
              ? 'You win!'
              : winner
                ? `${winner} wins!`
                : 'The match has ended.'}
          </p>
          <button
            className={`${buttonClassName} mt-8`}
            onClick={() => game.router.replace('/main-menu')}
            type="button"
          >
            Back to Main Menu
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-dvh max-h-dvh w-full max-w-7xl flex-col overflow-hidden p-3 text-center">
      <header className="mb-2 flex shrink-0 items-center justify-between gap-3 pr-10">
        <h1 className="text-xl font-bold sm:text-2xl">Game Board</h1>
        <button
          className={`${buttonClassName} shrink-0 px-3 py-1.5 text-sm`}
          onClick={() => game.router.push('/main-menu')}
          type="button"
        >
          Back to Main Menu
        </button>
      </header>

      <div className="min-h-0 flex-1">
        <HUD
          canRun={game.canRun}
          discardCount={game.playerState?.playerMat?.discardPile.length ?? 0}
          drawPileSize={game.playerState?.playerMat?.drawPileSize ?? 0}
          error={game.error}
          extraPanel={
            <PhasePanel
              energy={game.energy}
              finished={game.finished}
              gameId={game.gameId}
              hasPlayedCards={game.hasPlayedCards}
              isSubmitting={game.isSubmitting}
              isUpgrading={game.isUpgrading}
              onBuy={(upgrade, replace) => void game.handleBuy(upgrade, replace)}
              onError={game.setError}
              onSkip={() => void game.handleSkip()}
              owned={game.you?.upgrades ?? []}
              phase={game.phase}
              playerState={game.playerState}
              showingActivation={game.showingActivation}
              username={game.username}
              youSubmitted={game.youSubmitted}
            />
          }
          gameState={game.displayState}
          locked={game.locked}
          onHandOpen={() => game.setHandOpen((open) => !open)}
          onPlaceCard={game.placeCard}
          onRun={() => void game.handleRun()}
          onSwapRegisters={game.swapRegisters}
          placingCard={game.handOpen}
          player={game.player}
          activeRegisterIndex={game.activeRegisterIndex}
          offlineNotice={game.offlineNotice}
          onKickVote={game.setKickConfirm}
          waiting={game.waiting}
        >
          <Game
            board={game.board}
            laserBeats={game.laserBeats}
            shooters={game.shooters}
            onAnimationComplete={game.handleAnimationComplete}
            onStepIndexChange={game.handleStepIndexChange}
          />
        </HUD>
      </div>

      <GameOverlays
        availableHand={game.availableHand}
        choice={game.choice}
        discardCount={game.playerState?.playerMat?.discardPile.length ?? 0}
        drawPileSize={game.playerState?.playerMat?.drawPileSize ?? 0}
        finished={game.finished}
        handOpen={game.handOpen}
        isChoosing={game.isChoosing}
        isVoting={game.isVoting}
        kickConfirm={game.kickConfirm}
        onChoose={(option) => void game.handleChoose(option)}
        onCloseHand={() => {
          game.setHandOpen(false);
          game.setSelectedCardId(null);
        }}
        onKickBallot={(yes) => void game.handleKickBallot(yes)}
        onKickCancel={() => game.setKickConfirm(null)}
        onKickConfirm={() => void game.handleStartKickVote()}
        onSelectCard={game.setSelectedCardId}
        selectedCardId={game.selectedCardId}
        showingActivation={game.showingActivation}
        username={game.username}
        vote={game.vote}
      />
    </main>
  );
}
