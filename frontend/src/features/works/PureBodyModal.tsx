'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useModal } from '@/components/providers/ModalProvider';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import type { CSSVars } from '@/components/motion/shared';
import { getReducedMotion } from '@/hooks/useReducedMotion';
import { PUREBODY_SHOWCASE } from '@/content/projects';

/**
 * The PureBody showcase modal (reference L4863-4925, script L8295-8317): three phones with a lazy
 * screen recording each. A poster button starts a video; opening the modal starts all three, one
 * after another (300 + 120 * i ms, at once with reduced motion); closing pauses them. A video sets
 * `is-playing` on its phone while it plays and `is-failed` when it cannot load.
 *
 * The videos get their src on first start (data-src), so nothing downloads before the modal opens.
 */
export function PureBodyModal() {
  const show = PUREBODY_SHOWCASE;
  const modal = useModal();
  const phonesRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const videos = useCallback(
    () => Array.from(phonesRef.current?.querySelectorAll<HTMLVideoElement>('video') ?? []),
    [],
  );

  const start = useCallback((v: HTMLVideoElement) => {
    if (!v.getAttribute('src')) v.src = v.dataset.src ?? '';
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }, []);

  // The playing, pause and error classes on each phone (L8301-8306).
  useEffect(() => {
    const vids = videos();
    const offs = vids.map((v) => {
      const phone = v.closest('.wk-phone');
      const playing = () => phone?.classList.add('is-playing');
      const paused = () => phone?.classList.remove('is-playing');
      const failed = () => phone?.classList.add('is-failed');
      v.addEventListener('playing', playing);
      v.addEventListener('pause', paused);
      v.addEventListener('error', failed, true);
      return () => {
        v.removeEventListener('playing', playing);
        v.removeEventListener('pause', paused);
        v.removeEventListener('error', failed, true);
      };
    });
    return () => offs.forEach((off) => off());
  }, [videos]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const onOpen = useCallback(() => {
    if (phonesRef.current) phonesRef.current.scrollLeft = 0;
    const reduce = getReducedMotion();
    videos().forEach((v, i) => {
      timers.current.push(
        setTimeout(
          () => {
            if (modal.isOpen(show.id)) start(v);
          },
          reduce ? 0 : 300 + i * 120,
        ),
      );
    });
  }, [modal, show.id, start, videos]);

  const onClose = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    videos().forEach((v) => {
      try {
        v.pause();
      } catch {
        /* nothing to pause */
      }
    });
  }, [videos]);

  return (
    <Modal
      id={show.id}
      className="wk-pb"
      labelledBy="wk-pb-title"
      closeLabel={show.closeAriaLabel}
      onOpen={onOpen}
      onClose={onClose}
    >
      <div className="wk-pb__inner">
        <header className="wk-pb__head">
          <span className="wk-pb__kicker">
            <span className="dot-live" aria-hidden="true"></span>
            {show.kickerParts[0]} <i className="wk-sep" aria-hidden="true"></i>{' '}
            {show.kickerParts[1]}
          </span>
          <h2 className="wk-pb__title" id="wk-pb-title">
            {show.titleParts[0]}
            <span className="serif grad-text">{show.titleParts[1]}</span>
          </h2>
          <p className="wk-pb__lead">{show.lead}</p>
          <a
            className="link-arrow wk-pb__full"
            href={show.fullPage.href}
            target="_blank"
            rel="noopener"
          >
            {show.fullPage.label}
            <span className="sr-only">{show.fullPage.srSuffix}</span>
          </a>
        </header>

        <div className="wk-pb__stage">
          <div className="wk-pb__phones" id="wk-pb-phones" ref={phonesRef}>
            {show.demos.map((demo) => (
              <figure
                className="wk-phone"
                style={{ '--i': demo.index } as CSSVars}
                key={demo.index}
              >
                <div className="wk-phone__frame">
                  <div className="wk-phone__screen">
                    <button
                      type="button"
                      className="wk-phone__poster"
                      aria-label={demo.posterAriaLabel}
                      onClick={(e) => {
                        const v = e.currentTarget
                          .closest('.wk-phone__screen')
                          ?.querySelector('video');
                        if (v) start(v);
                      }}
                    >
                      <span className="wk-phone__brand">{show.posterBrand}</span>
                      <span className="wk-phone__play">
                        <Icon name="i-play" fill />
                      </span>
                      <span className="wk-phone__cap">{demo.posterCaption}</span>
                    </button>
                    <video
                      muted
                      loop
                      playsInline
                      preload="none"
                      data-src={demo.video}
                      aria-label={demo.videoAriaLabel}
                    />
                    <span className="wk-phone__island" aria-hidden="true"></span>
                  </div>
                </div>
                <figcaption className="wk-phone__fig">{demo.figcaption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
