/*
 * @author Stéphane LaFlèche <stephane.l@vanillaforums.com>
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import { styleFactory, useThemeCache, variableFactory } from "@library/styles/styleUtils";
import { FULL_GUTTER, globalVariables } from "@library/styles/globalStyleVars";
import { IThemeVariables } from "@library/theming/themeReducer";
import { getLayouts } from "@library/layout/types/layouts";
import { LayoutTypes } from "@library/layout/LayoutContext";
import { camelCaseToDash } from "@dashboard/compatibilityStyles";
import { panelAreaClasses } from "@library/layout/panelAreaStyles";
import { panelListClasses } from "@library/layout/panelListStyles";
import { calc, percent, viewHeight } from "csx";
import { margins, paddings } from "@library/styles/styleHelpersSpacing";
import { sticky, unit } from "@library/styles/styleHelpers";
import { panelBackgroundVariables } from "@library/layout/panelBackgroundStyles";
import { panelWidgetVariables } from "@library/layout/panelWidgetStyles";
import { important } from "csx/lib/strings";
import { cssRule } from "typestyle";
import { threeColumnLayout } from "@library/layout/types/threeColumn";

export const layoutVariables = useThemeCache((forcedVars?: IThemeVariables) => {
    const globalVars = globalVariables(forcedVars);
    const makeThemeVars = variableFactory("layouts", forcedVars);

    const fullGutter = globalVars ? globalVars.constants.fullGutter : FULL_GUTTER;

    const gutter = makeThemeVars("gutter", {
        full: fullGutter, // 48
        size: fullGutter / 2, // 24
        halfSize: fullGutter / 4, // 12
        quarterSize: fullGutter / 8, // 6
    });

    const spacing = makeThemeVars("spacing", {
        margin: {
            top: 0,
            bottom: 0,
        },
        padding: {
            top: gutter.halfSize * 1.5,
        },
        extraPadding: {
            top: 32,
            bottom: 32,
            noBreadcrumbs: {},
            mobile: {
                noBreadcrumbs: {
                    top: 16,
                },
            },
        },
        largePadding: {
            top: 64,
        },
        offset: {
            left: -44,
            right: -36,
        },
        withPanelBackground: {
            gutter: 70,
        },
    });

    const layouts = getLayouts();
    return {
        gutter,
        spacing,
        layouts,
        /*
         * @deprecated You should get the media queries through "layouts" declared above
         */
        mediaQueries: threeColumnLayout().mediaQueries,
    };
});

// This class shouldn't be used directly, either get it from the layout context or from layoutClassesForCurrentLayout()
const layoutClasses = (props: { type?: LayoutTypes }) => {
    const { type = LayoutTypes.THREE_COLUMNS } = props;
    const vars = layoutVariables();
    const globalVars = globalVariables();

    const layoutTypeVariables = vars.layouts.types[type];
    const mediaQueries = vars.layouts.mediaQueries;

    const style = styleFactory("layout" + camelCaseToDash(type.replace(/\s+/g, "")));
    const classesPanelArea = panelAreaClasses();
    const classesPanelList = panelListClasses();

    const main = style("main", {
        minHeight: viewHeight(20),
        width: percent(100),
    });

    console.log("undefined?: ", LayoutTypes);

    const root = style(
        {
            ...margins(layoutTypeVariables.spacing.margin),
            width: percent(100),
            $nest: {
                [`&.noBreadcrumbs > .${main}`]: {
                    paddingTop: unit(globalVars.gutter.size),
                    ...mediaQueries({
                        [LayoutTypes.THREE_COLUMNS]: {
                            oneColumnDown: {
                                paddingTop: 0,
                            },
                        },
                    }),
                },
                "&.isOneCol": {
                    width: unit(layoutTypeVariables.middleColumnPaddedWidth()),
                    maxWidth: percent(100),
                    margin: "auto",
                    ...vars.mediaQueries.oneColumnDown({
                        width: percent(100),
                    }),
                },
                "&.hasTopPadding": {
                    paddingTop: unit(layoutTypeVariables.spacing.extraPadding.top),
                },
                "&.hasTopPadding.noBreadcrumbs": {
                    paddingTop: unit(layoutTypeVariables.spacing.extraPadding.mobile.noBreadcrumbs.top),
                },
                "&.hasLargePadding": {
                    ...paddings(layoutTypeVariables.spacing.largePadding),
                },
            },
        },

        vars.mediaQueries.oneColumnDown({
            $nest: {
                "&.hasTopPadding.noBreadcrumbs": {
                    paddingTop: unit(layoutTypeVariables.spacing.extraPadding.mobile.noBreadcrumbs.top),
                },
            },
        }),
    );

    const content = style("content", {
        display: "flex",
        flexGrow: 1,
        width: percent(100),
        justifyContent: "space-between",
    });

    const panel = style("panel", {
        width: percent(100),
        $nest: {
            [`& > .${classesPanelArea.root}:first-child .${classesPanelList.root}`]: {
                marginTop: unit(
                    (globalVars.fonts.size.title * globalVars.lineHeights.condensed) / 2 -
                        globalVariables().fonts.size.medium / 2,
                ),
            },
        },
    });

    const top = style("top", {
        width: percent(100),
        marginBottom: unit(globalVars.gutter.half),
    });

    const container = style("container", {
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
    });

    const fullWidth = style("fullWidth", {
        position: "relative",
        padding: 0,
    });

    const offset = panelBackgroundVariables().config.render
        ? layoutTypeVariables.spacing.withPanelBackground.gutter - panelWidgetVariables().spacing.padding * 2
        : 0;

    const leftColumn = style("leftColumn", {
        position: "relative",
        width: unit(layoutTypeVariables.panelPaddedWidth()),
        flexBasis: unit(layoutTypeVariables.panelPaddedWidth()),
        minWidth: unit(layoutTypeVariables.panelPaddedWidth()),
        paddingRight: unit(offset),
    });

    const rightColumn = style("rightColumn", {
        position: "relative",
        width: unit(layoutTypeVariables.panelPaddedWidth()),
        flexBasis: unit(layoutTypeVariables.panelPaddedWidth()),
        minWidth: unit(layoutTypeVariables.panelPaddedWidth()),
        overflow: "initial",
        paddingLeft: unit(offset),
    });

    const middleColumn = style("middleColumn", {
        justifyContent: "space-between",
        flexGrow: 1,
        width: percent(100),
        maxWidth: percent(100),
        paddingBottom: unit(layoutTypeVariables.spacing.extraPadding.bottom),
        ...vars.mediaQueries.oneColumnDown(paddings({ left: important(0), right: important(0) })),
    });

    const middleColumnMaxWidth = style("middleColumnMaxWidth", {
        $nest: {
            "&.hasAdjacentPanel": {
                flexBasis: calc(`100% - ${unit(layoutTypeVariables.panelPaddedWidth())}`),
                maxWidth: calc(`100% - ${unit(layoutTypeVariables.panelPaddedWidth())}`),
                ...vars.mediaQueries.oneColumnDown({
                    flexBasis: percent(100),
                    maxWidth: percent(100),
                }),
            },
            "&.hasTwoAdjacentPanels": {
                flexBasis: calc(`100% - ${unit(layoutTypeVariables.panelPaddedWidth() * 2)}`),
                maxWidth: calc(`100% - ${unit(layoutTypeVariables.panelPaddedWidth() * 2)}`),
                ...vars.mediaQueries.oneColumnDown({
                    flexBasis: percent(100),
                    maxWidth: percent(100),
                }),
            },
        },
    });

    const breadcrumbs = style("breadcrumbs", {});

    const isSticky = style(
        "isSticky",
        {
            ...sticky(),
            height: percent(100),
            $unique: true,
        },
        vars.mediaQueries.oneColumnDown({
            position: "relative",
            top: "auto",
            left: "auto",
            bottom: "auto",
        }),
    );

    // To remove when we have overlay styles converted
    cssRule(`.overlay .${root}.noBreadcrumbs .${main}`, {
        paddingTop: 0,
    });

    const breadcrumbsContainer = style("breadcrumbs", {
        paddingBottom: unit(10),
    });

    return {
        root,
        content,
        top,
        main,
        container,
        fullWidth,
        leftColumn,
        rightColumn,
        middleColumn,
        middleColumnMaxWidth,
        panel,
        isSticky,
        breadcrumbs,
        breadcrumbsContainer,
    };
};

export const layoutClassesForCurrentLayout = (props: { type: LayoutTypes }) => {
    const { type = LayoutTypes.THREE_COLUMNS } = props;
    switch (type) {
        case LayoutTypes.ONE_COLUMN_NARROW:
        case LayoutTypes.TWO_COLUMNS:
        case LayoutTypes.LEGACY:
            return layoutClasses({ type });
        default:
            // Catch any invalid types into this one
            return layoutClasses({ type: LayoutTypes.THREE_COLUMNS });
    }
};
