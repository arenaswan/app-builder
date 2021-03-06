import React from 'react';

import AppLauncher from '@salesforce/design-system-react/components/app-launcher'; 
import AppLauncherLink from '@salesforce/design-system-react/components/app-launcher/link';
import AppLauncherTile from '@salesforce/design-system-react/components/app-launcher/tile';
import AppLauncherExpandableSection from '@salesforce/design-system-react/components/app-launcher/expandable-section';

import GlobalNavigationBar from '@salesforce/design-system-react/components/global-navigation-bar';
import GlobalNavigationBarRegion from '@salesforce/design-system-react/components/global-navigation-bar/region';

import Button from '@salesforce/design-system-react/components/button';
import Search from '@salesforce/design-system-react/components/input/search';
import IconSettings from '@salesforce/design-system-react/components/icon-settings';
import actionSprite from '@salesforce-ux/design-system/assets/icons/action-sprite/svg/symbols.svg';
import customSprite from '@salesforce-ux/design-system/assets/icons/custom-sprite/svg/symbols.svg';
import standardSprite from '@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg';
import utilitySprite from '@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg';
import Icon from '@salesforce/design-system-react/components/icon'; 
import { each, unionBy, filter} from 'lodash';

function getTabs(apps){
	let tabs = [];
	each(apps, function(app){
		each(app.children, (tab)=>{
			tabs.push(Object.assign({}, tab, {appApiName: app.id}))
		})
	})
	return unionBy(tabs, "id");;
}

export class SteedosAppLauncher extends React.Component {
	static displayName = 'Steedos App Launcher';
	state = {
		search: '',
		open: false,
	};

	onSearch = (event) => {
		this.setState({ search: event.target.value });
	};
	triggerOnClick = ()=> {
		this.setState({open: !this.state.open})
	}
	onClick=(value, e)=>{
		if(this.props.history){
			if(value.type ==='url'){
				this.props.history.push(`/app/${value.appApiName}/frame/${value.id}`, {src: value.path, title: value.name});
			}else{
				this.props.history.push(value.path);
			}
			
		}
		this.setState({open: false})
	}
	onClose=()=>{
		this.setState({open: false})
	}
	render() {
		const search = (
			<Search
				onChange={(event) => {
					console.log('Search term:', event.target.value);
					this.onSearch(event);
				}}
				placeholder="???????????????????????????..."
				assistiveText={{ label: '???????????????????????????...' }}
			/>
		);
		const headerButton = <Button label="App Exchange" />;
		let { currentApp, apps  } = this.props;
		if(!currentApp){
			currentApp = {}
		}
		if(!apps){
			apps = []
		}
		const tabs = getTabs(apps);
		return (
			<IconSettings actionSprite={actionSprite} standardSprite={standardSprite} customSprite={customSprite} utilitySprite={utilitySprite}>
				<GlobalNavigationBar>
					<GlobalNavigationBarRegion region="primary">
						<AppLauncher
							title="?????????????????????"
							triggerName={currentApp.name}
							search={search}
							// modalHeaderButton={headerButton}
							onClose={this.onClose}
							isOpen={this.state.open}
							triggerOnClick={this.triggerOnClick}
						>
							<AppLauncherExpandableSection title="??????????????????">
								{filter(apps, (app)=> { return app.name.indexOf(this.state.search) > -1; })?.map((app, i) => (
									<AppLauncherTile
										key={app.id}
										description={app.description}
										// iconText={app.icon}
										iconNode={<Icon
											assistiveText={{ label: app.name }}
											category="standard"
											name={app.icon}
											size="large"
										/>}
										search={this.state.search}
										title={app.name}
										onClick={(e)=>{return this.onClick(app,e)}}
									/>
								))}
							</AppLauncherExpandableSection>
							<hr />
							<AppLauncherExpandableSection title="????????????">
								{filter(tabs, (tab)=> { return tab.name.indexOf(this.state.search) > -1; })?.map((tab, i) => (
									<AppLauncherLink key={tab.id} search={this.state.search} onClick={(e)=>{return this.onClick(tab,e)}} >{tab.name}</AppLauncherLink>
								))}
							</AppLauncherExpandableSection>
						</AppLauncher>
					</GlobalNavigationBarRegion>
				</GlobalNavigationBar>
			</IconSettings>
		);
	}
}
