<script lang="ts">
  import { getTippySingleton, tippy } from "$lib/tippy";

  export let species: string;
  export let scaffold: string;
  export let geneId: string;
  export let proteinId: string;
  export let start: number;
  export let end: number;

  export let x: number;
  export let y: number;
  export let width: number;
  export let height: number;
  export let colour: string;
  export let cursor: string;

  //
  const singleton = getTippySingleton();
</script>

<g>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <rect
    {x}
    {y}
    {width}
    {height}
    {cursor}
    fill={colour}
    on:click
    use:tippy={{
      singleton,
      content: `
        <div>
          <table style="border-collapse: separate; border-spacing: 0.5rem 0.5rem;">
            <tbody>
              <tr>
                <td>Species</td>
                <td>${species}</td>
              </tr>
              <tr>
                <td>Chromosome</td>
                <td>${scaffold}</td>
              </tr>
              <tr>
                <td>Gene</td>
                <td>${geneId}</td>
              </tr>
              <tr>
                <td>Protein</td>
                <td>${proteinId}</td>
              </tr>
              <tr>
                <td>Location</td>
                <td>${start}:${end}</td>
              </tr>
              <tr>
                <td>Source</td>
                <td><a href="https://www.ensembl.org/Gene/Summary?g=${geneId}" target="_blank">Ensembl</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
    }}
  />
</g>
