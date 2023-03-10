#!/bin/bash

bm="$(realpath "$(dirname "$0")")";
data="$bm/src/";
cd "$bm";
(
	cd "$data";
	head -n4 index.html | tr -d '\n	';
	echo -n "<link rel=\"shortcut icon\" sizes=\"any\" href=\"data:image/svg+xml,";
	cat icon.svg | tr -d '\n	' | sed -e 's/"/'"'"'/g' -e 's/#/\%23/g';
	echo -n "\" />";
	echo -n "<script type=\"module\">";
	jspacker -n -i "/$(grep "<script" index.html | sed -e 's/.*src="\([^"]*\)".*/\1/')" | terser -m  --module --compress pure_getters,passes=3 --ecma 6 | tr -d '\n';
	echo -n "</script>";
	tail -n4 index.html | tr -d '\n	';
) > "index.html";
