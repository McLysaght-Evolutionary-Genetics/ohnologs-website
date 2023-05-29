import { parse } from "newick-js";
import type * as _ from "newick-js";

export type PhyloTree = _.ParseResult;
export type Vertex = _.Vertex;
export type Graph = _.Graph;
export type Arc = _.Arc;

export const parseNewick = (newick: string): PhyloTree => {
  return parse(newick);
};
