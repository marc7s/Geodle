export default async function AboutPage() {
  return (
    <>
      <div className='flex flex-col justify-center items-center [&>p]:max-w-lg [&>ol]:max-w-lg [&>p]:mt-7 text-center'>
        <h1 className='text-2xl mb-2'>About this website</h1>

        <p>
          This website is a collection of geography based minigames. It is
          inspired by the numerous amounts of Wordle clones, especially those
          with a geography theme.
        </p>

        <p>
          The goal of this website is to learn geography, which is an interest
          of mine. There is of course a competitive nature in games like these,
          but the goal is to learn, and no particular effort has therefore been
          put into preventing cheating or creating leaderboards.
        </p>

        <p>I created this website to solve the following main issues:</p>
        <ol className='list-decimal text-left mt-3 [&>li]:mb-2'>
          <li>
            Several minigame sites only support one daily game without the
            possibility to continue in order to train and improve
          </li>
          <li>I don&apos;t like ads</li>
          <li>
            With one game per website, there are a lot of links to keep track
            of; each website with their own UI and default language
          </li>
          <li>Very limited customisability</li>
        </ol>

        <p>
          Here is how I&apos;ve tried to address these issues through this
          website:
        </p>
        <ol className='list-decimal text-left mt-3 [&>li]:mb-2'>
          <li>
            All minigames has both a daily mode with one solution per day, and a
            training mode for unlimited rounds
          </li>
          <li>No ads</li>
          <li>
            All minigames in one website with a cohesive user experience,
            hopefully enough for a daily routine
          </li>
          <li>
            High customisability where each game can be modified with the
            parameters - from changing regions to guessing capitals instead of
            countries
          </li>
        </ol>

        <p className='pt-7'>
          Created by{' '}
          <a href='https://github.com/marc7s/Geodle' target='_blank'>
            marc7s
          </a>
        </p>
      </div>
    </>
  );
}
