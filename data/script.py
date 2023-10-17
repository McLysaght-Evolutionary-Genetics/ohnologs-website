import pandas as pd

if __name__ == "__main__":
    # r1 = pd.read_csv("terms_1r.tsv", sep="\t", names=["terms"], header=None)
    # r2 = pd.read_csv("terms_2r.tsv", sep="\t", names=["terms"], header=None)
    #
    # r1 = list(r1.terms)
    # r2 = list(r2.terms)
    #
    # print(len(r1), len(r2), len(set(r1 + r2)))

    #

    go = pd.read_csv("analysis_1r.txt", sep="\t", names=["term", "b", "c", "d", "e", "f", "g", "sig"], header=None)

    terms = []

    for _, row in go.iterrows():
        term = row.term
        sig = row.sig

        if sig > 1e-5:
            continue

        start = term.index("(")
        end = term.index(")")

        term = term[start + 1:end]

        terms.append((term, sig))

    with open("terms_1r.tsv", "w") as f:
        for term, sig in terms:
            f.write(f"{term}\t{sig}\n")

    #

    # genes = pd.read_csv("genes.tsv", sep="\t", names=["species", "scaffold", "segment", "family", "gene", "protein", "start", "end", "pvc", "pgc"], header=None, comment="#")
    # ohnology = pd.read_csv("gene_ohnology.tsv", sep="\t", names=["query", "subject", "relation"], header=None, comment="#")

    # ohnology = ohnology.merge(genes, how="left", left_on="query", right_on="protein")
    # ohnology = ohnology.merge(genes, how="left", left_on="subject", right_on="protein")

    # ohnology = ohnology[(ohnology.species_x == "human") & (ohnology.species_y == "human")]

    # r1 = ohnology[ohnology.relation == 1].reset_index()
    # r2 = ohnology[ohnology.relation == 2].reset_index()

    # r1 = list(set(list(r1["gene_x"]) + list(r1["gene_y"])))
    # r2 = list(set(list(r2["gene_x"]) + list(r2["gene_y"])))

    # with open("r1.tsv", "w") as f:
    #     for gene in r1:
    #         if gene in r2:
    #             continue

    #         f.write(f"{gene}\n")

    # with open("r2.tsv", "w") as f:
    #     for gene in r2:
    #         if gene in r1:
    #             continue

    #         f.write(f"{gene}\n")
